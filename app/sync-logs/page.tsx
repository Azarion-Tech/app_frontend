'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { syncLogsApi, handleApiError } from '@/lib/api'
import { SyncLog } from '@/types'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { Search, Filter, RefreshCw, AlertCircle, CheckCircle, Clock, Eye, Trash2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function SyncLogsPage() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [marketplaceFilter, setMarketplaceFilter] = useState('')
  const [operationFilter, setOperationFilter] = useState('')
  const [filteredLogs, setFilteredLogs] = useState<SyncLog[]>([])

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    let filtered = logs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.marketplace_product_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.error_message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    // Filter by marketplace
    if (marketplaceFilter) {
      filtered = filtered.filter(log => log.marketplace === marketplaceFilter)
    }

    // Filter by operation
    if (operationFilter) {
      filtered = filtered.filter(log => log.operation === operationFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, statusFilter, marketplaceFilter, operationFilter])

  const loadLogs = async () => {
    try {
      const data = await syncLogsApi.getAll()
      setLogs(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este log?')) {
      try {
        await syncLogsApi.delete(id)
        toast.success('Log excluído com sucesso!')
        loadLogs()
      } catch (error: any) {
        toast.error(handleApiError(error))
      }
    }
  }

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'success', label: 'Sucesso' },
    { value: 'error', label: 'Erro' },
    { value: 'pending', label: 'Pendente' },
  ]

  const marketplaceOptions = [
    { value: '', label: 'Todos' },
    { value: 'mercadolivre', label: 'Mercado Livre' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'magalu', label: 'Magazine Luiza' },
  ]

  const operationOptions = [
    { value: '', label: 'Todas' },
    { value: 'create', label: 'Criar' },
    { value: 'update', label: 'Atualizar' },
    { value: 'delete', label: 'Deletar' },
    { value: 'sync', label: 'Sincronizar' },
  ]

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'update':
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />
      case 'sync':
        return <RefreshCw className="h-4 w-4 text-purple-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getMarketplaceName = (marketplace: string) => {
    const names: Record<string, string> = {
      mercadolivre: 'Mercado Livre',
      amazon: 'Amazon',
      magalu: 'Magazine Luiza',
    }
    return names[marketplace] || marketplace
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Logs de Sincronização</h1>
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
            <h1 className="text-2xl font-bold text-gray-900">Logs de Sincronização</h1>
            <p className="mt-1 text-sm text-gray-500">
              Histórico de sincronizações com marketplaces
            </p>
          </div>
          <Button onClick={() => loadLogs()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID ou erro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={marketplaceFilter}
                  onChange={(e) => setMarketplaceFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {marketplaceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={operationFilter}
                  onChange={(e) => setOperationFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {operationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter || marketplaceFilter || operationFilter
                  ? 'Tente ajustar os filtros'
                  : 'Logs de sincronização aparecerão aqui'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        {getOperationIcon(log.operation)}
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {log.operation}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusText(log.status)}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getMarketplaceName(log.marketplace)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Produto ID</p>
                          <Link href={`/products/${log.product_id}`}>
                            <p className="font-medium text-blue-600 hover:underline">
                              #{log.product_id}
                            </p>
                          </Link>
                        </div>

                        {log.marketplace_product_id && (
                          <div>
                            <p className="text-gray-500">ID no Marketplace</p>
                            <p className="font-medium font-mono text-xs">
                              {log.marketplace_product_id}
                            </p>
                          </div>
                        )}

                        {log.duration_ms && (
                          <div>
                            <p className="text-gray-500">Duração</p>
                            <p className="font-medium">{log.duration_ms}ms</p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-500">Data</p>
                          <p className="font-medium text-xs">{formatDate(log.created_at)}</p>
                        </div>
                      </div>

                      {log.error_message && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-red-800 font-medium">Erro:</p>
                            <p className="text-sm text-red-700 mt-1">{log.error_message}</p>
                          </div>
                        </div>
                      )}

                      {log.response_data && log.status === 'success' && (
                        <div className="mt-3">
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                              Ver resposta do marketplace
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-auto">
                              {JSON.stringify(log.response_data, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Link href={`/sync-logs/${log.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(log.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
