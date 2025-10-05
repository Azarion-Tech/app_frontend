'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { syncLogsApi, handleApiError } from '@/lib/api'
import { SyncLog } from '@/types'
import { formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function SyncLogDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [log, setLog] = useState<SyncLog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadLog()
    }
  }, [id])

  const loadLog = async () => {
    try {
      const data = await syncLogsApi.getById(parseInt(id))
      setLog(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
      router.push('/sync-logs')
    } finally {
      setLoading(false)
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
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!log) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Log não encontrado
          </h3>
          <Link href="/sync-logs">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Logs
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center space-x-4">
          <Link href="/sync-logs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalhes da Sincronização
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Log #{log.id} - {formatDate(log.created_at)}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {log.status === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                ) : log.status === 'error' ? (
                  <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-500 mr-2" />
                )}
                Status da Sincronização
              </CardTitle>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                {getStatusText(log.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Operação</p>
                <p className="text-lg font-semibold capitalize">{log.operation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marketplace</p>
                <p className="text-lg font-semibold">{getMarketplaceName(log.marketplace)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Produto ID</p>
                <Link href={`/products/${log.product_id}`}>
                  <p className="text-lg font-semibold text-blue-600 hover:underline">
                    #{log.product_id}
                  </p>
                </Link>
              </div>
              {log.marketplace_product_id && (
                <div>
                  <p className="text-sm text-gray-500">ID no Marketplace</p>
                  <p className="text-lg font-semibold font-mono">{log.marketplace_product_id}</p>
                </div>
              )}
              {log.duration_ms && (
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="text-lg font-semibold">{log.duration_ms} ms</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Data/Hora</p>
                <p className="text-lg font-semibold">{formatDate(log.created_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {log.error_message && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Mensagem de Erro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 whitespace-pre-wrap">{log.error_message}</p>
            </CardContent>
          </Card>
        )}

        {/* Request Data */}
        {log.request_data && (
          <Card>
            <CardHeader>
              <CardTitle>Dados da Requisição</CardTitle>
              <CardDescription>
                Dados enviados para o marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(log.request_data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Response Data */}
        {log.response_data && (
          <Card>
            <CardHeader>
              <CardTitle>Resposta do Marketplace</CardTitle>
              <CardDescription>
                Dados retornados pelo marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-50 border border-gray-200 rounded-md text-xs overflow-auto max-h-96">
                {JSON.stringify(log.response_data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ID do Log</span>
              <span className="font-medium">#{log.id}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600">Criado em</span>
              <span className="font-medium">{formatDate(log.created_at)}</span>
            </div>
            {log.updated_at && (
              <div className="flex justify-between py-2 border-t">
                <span className="text-gray-600">Atualizado em</span>
                <span className="font-medium">{formatDate(log.updated_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
