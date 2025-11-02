'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { integrationsApi, handleApiError } from '@/lib/api'
import { MarketplaceIntegration } from '@/types'
import { formatDate } from '@/lib/utils'
import { Plus, Settings, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'
import MarketplaceCard from '@/components/integrations/MarketplaceCard'

const marketplaces = [
  {
    name: 'Mercado Livre',
    logo: 'https://www.logosvg.com.br/logos/mercado-livre-88.svg',
    color: '#FFE600',
    marketplace_id: 'mercadolivre',
  },
  {
    name: 'Amazon',
    logo: 'https://www.logosvg.com.br/logos/amazon-2.svg',
    color: '#FF9900',
    marketplace_id: 'amazon',
  },
  {
    name: 'Magazine Luiza',
    logo: 'https://images.seeklogo.com/logo-png/45/1/magalu-logo-png_seeklogo-452237.png',
    color: '#0086FF',
    marketplace_id: 'magalu',
  },
  {
    name: 'Shopee',
    logo: 'https://images.seeklogo.com/logo-png/32/1/shopee-logo-png_seeklogo-326282.png',
    color: '#EE4D2D',
    marketplace_id: 'shopee',
  },
];


export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<number | null>(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const data = await integrationsApi.getAll()
      setIntegrations(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async (id: number) => {
    setTesting(id)
    try {
      await integrationsApi.testConnection(id)
      toast.success('Conexão testada com sucesso!')
      loadIntegrations()
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setTesting(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta integração?')) {
      try {
        await integrationsApi.delete(id)
        toast.success('Integração excluída com sucesso!')
        loadIntegrations()
      } catch (error: any) {
        toast.error(handleApiError(error))
      }
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

  const handleConnect = (marketplaceName: string) => {
    // For now, redirect to the new integration page
    // In the future, this will redirect to the marketplace's OAuth page.
    window.location.href = `/integrations/new?marketplace=${marketplaceName.toLowerCase().replace(' ', '-')}`;
  };

  const handleDisconnect = async (marketplaceName: string) => {
    const integration_to_delete = integrations.find(
        (integration) => integration.marketplace === marketplaceName.toLowerCase().replace(' ', '-')
    );
    if(integration_to_delete){
        await handleDelete(integration_to_delete.id);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Integrações com Marketplaces</h1>
            <p className="mt-1 text-sm text-gray-500">
              Conecte seus marketplaces para sincronizar produtos e pedidos automaticamente
            </p>
          </div>
          <Link href="/integrations/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {marketplaces.map((marketplace) => (
            <MarketplaceCard
              key={marketplace.name}
              marketplace={marketplace}
              isConnected={integrations.some((integration) => integration.marketplace === marketplace.marketplace_id)}
              onConnect={() => handleConnect(marketplace.name)}
              onDisconnect={() => handleDisconnect(marketplace.name)}
            />
          ))}
        </div>

        {integrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma integração configurada
              </h3>
              <p className="text-gray-500 mb-6">
                Conecte seus marketplaces para sincronizar produtos e pedidos automaticamente
              </p>
              <Link href="/integrations/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Integração
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-gray-800">Minhas Integrações</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div>
                            <CardTitle className="text-lg">
                              {getMarketplaceName(integration.marketplace)}
                            </CardTitle>
                            {integration.marketplace_account_id && (
                              <CardDescription className="text-xs">
                                ID: {integration.marketplace_account_id}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {integration.is_connected ? (
                            <CheckCircle className="h-5 w-5 text-green-500" title="Conectado" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" title="Desconectado" />
                          )}
                          {integration.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        {integration.sync_frequency && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Frequência de Sync:</span>
                            <span className="font-medium">{integration.sync_frequency}</span>
                          </div>
                        )}
                        {integration.last_sync && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Última Sincronização:</span>
                            <span className="font-medium text-xs">{formatDate(integration.last_sync)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Auto-sync:</span>
                          <span className="font-medium">
                            {integration.auto_sync_enabled ? 'Ativado' : 'Desativado'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Criado em:</span>
                          <span className="font-medium text-xs">{formatDate(integration.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(integration.id)}
                          disabled={testing === integration.id}
                          className="w-full"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${testing === integration.id ? 'animate-spin' : ''}`} />
                          {testing === integration.id ? 'Testando...' : 'Testar Conexão'}
                        </Button>

                        <div className="flex space-x-2">
                          <Link href={`/integrations/${integration.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(integration.id)}
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
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
