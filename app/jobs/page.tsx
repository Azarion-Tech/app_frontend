'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { jobsApi, handleApiError } from '@/lib/api'
import { BackgroundJob } from '@/types'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { Activity, PlayCircle, XCircle, RefreshCw, Filter, Clock } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'

export default function JobsPage() {
  const [jobs, setJobs] = useState<BackgroundJob[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [filteredJobs, setFilteredJobs] = useState<BackgroundJob[]>([])

  useEffect(() => {
    loadJobs()
    // Auto refresh every 5 seconds
    const interval = setInterval(loadJobs, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (statusFilter) {
      setFilteredJobs(jobs.filter(job => job.status === statusFilter))
    } else {
      setFilteredJobs(jobs)
    }
  }, [jobs, statusFilter])

  const loadJobs = async () => {
    try {
      const data = await jobsApi.getAll()
      setJobs(data)
    } catch (error: any) {
      // Silently fail on auto-refresh
      if (!loading) return
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (id: string) => {
    try {
      await jobsApi.retry(id)
      toast.success('Job reenviado com sucesso!')
      loadJobs()
    } catch (error: any) {
      toast.error(handleApiError(error))
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este job?')) {
      try {
        await jobsApi.cancel(id)
        toast.success('Job cancelado com sucesso!')
        loadJobs()
      } catch (error: any) {
        toast.error(handleApiError(error))
      }
    }
  }

  const handleTriggerJob = async (type: string, marketplace?: string) => {
    try {
      let result
      switch (type) {
        case 'sync-products':
          if (!marketplace) return
          result = await jobsApi.syncProducts(marketplace)
          break
        case 'import-orders':
          if (!marketplace) return
          result = await jobsApi.importOrders(marketplace)
          break
        case 'inventory-analysis':
          result = await jobsApi.runInventoryAnalysis()
          break
        case 'stock-optimization':
          result = await jobsApi.runStockOptimization()
          break
        case 'weekly-summary':
          result = await jobsApi.sendWeeklySummary()
          break
      }
      toast.success('Job iniciado com sucesso!')
      loadJobs()
    } catch (error: any) {
      toast.error(handleApiError(error))
    }
  }

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendente' },
    { value: 'in_progress', label: 'Em Progresso' },
    { value: 'completed', label: 'Concluído' },
    { value: 'failed', label: 'Falhou' },
  ]

  const getTaskName = (taskName: string) => {
    const names: Record<string, string> = {
      'sync_products': 'Sincronizar Produtos',
      'import_orders': 'Importar Pedidos',
      'inventory_analysis': 'Análise de Inventário',
      'stock_optimization': 'Otimização de Estoque',
      'weekly_summary': 'Resumo Semanal',
    }
    return names[taskName] || taskName
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs e Tarefas em Background</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitore e gerencie tarefas assíncronas do sistema
            </p>
          </div>
          <Button onClick={() => loadJobs()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Iniciar novas tarefas em background</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button onClick={() => handleTriggerJob('inventory-analysis')} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Análise de Inventário
            </Button>
            <Button onClick={() => handleTriggerJob('stock-optimization')} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Otimização de Estoque
            </Button>
            <Button onClick={() => handleTriggerJob('weekly-summary')} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Resumo Semanal
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum job encontrado
              </h3>
              <p className="text-gray-500">
                {statusFilter ? 'Tente ajustar os filtros' : 'Jobs aparecerão aqui quando forem iniciados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getTaskName(job.task_name)}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Job ID</p>
                          <p className="font-medium font-mono text-xs">{job.job_id}</p>
                        </div>

                        <div>
                          <p className="text-gray-500">Criado em</p>
                          <p className="font-medium">{formatDate(job.created_at)}</p>
                        </div>

                        {job.started_at && (
                          <div>
                            <p className="text-gray-500">Iniciado em</p>
                            <p className="font-medium">{formatDate(job.started_at)}</p>
                          </div>
                        )}

                        {job.completed_at && (
                          <div>
                            <p className="text-gray-500">Concluído em</p>
                            <p className="font-medium">{formatDate(job.completed_at)}</p>
                          </div>
                        )}
                      </div>

                      {job.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800 font-medium mb-1">Erro:</p>
                          <p className="text-sm text-red-700">{job.error_message}</p>
                        </div>
                      )}

                      {job.result && job.status === 'completed' && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800 font-medium mb-1">Resultado:</p>
                          <pre className="text-xs text-green-700 overflow-auto">
                            {JSON.stringify(job.result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {job.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(job.job_id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Tentar Novamente
                        </Button>
                      )}
                      {(job.status === 'pending' || job.status === 'in_progress') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(job.job_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
