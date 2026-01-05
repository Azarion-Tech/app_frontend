'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { integrationsApi, handleApiError, mlIntegrationApi } from '@/lib/api'
import { MarketplaceIntegration } from '@/types'
import { Plus } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'
import MarketplaceCard from '@/components/integrations/MarketplaceCard'
import { useAuthStore } from '@/stores/authStore'

const marketplaces = [
  {
    name: 'Mercado Livre',
    emoji: '🛒',
    color: '#FFE600',
    textColor: '#2D3561',
    marketplace_id: 'mercadolivre',
    available: true,
    description: 'Conecte sua conta e sincronize produtos'
  },
  {
    name: 'Amazon',
    emoji: '📦',
    color: '#FF9900',
    textColor: '#FFFFFF',
    marketplace_id: 'amazon',
    available: false,
    description: 'Em breve'
  },
  {
    name: 'Magazine Luiza',
    emoji: '🏪',
    color: '#0086FF',
    textColor: '#FFFFFF',
    marketplace_id: 'magalu',
    available: false,
    description: 'Em breve'
  },
  {
    name: 'Shopee',
    emoji: '🛍️',
    color: '#EE4D2D',
    textColor: '#FFFFFF',
    marketplace_id: 'shopee',
    available: false,
    description: 'Em breve'
  },
];


export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [mlIntegrations, setMlIntegrations] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    loadIntegrations()
    loadMlIntegrations()
  }, [user])

  const loadMlIntegrations = async () => {
    try {
        const data = await mlIntegrationApi.listIntegrations();
        setMlIntegrations(data.integrations || []);
    } catch (error: any) {
        console.error('Erro ao carregar integracoes ML:', error);
    }
  }

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

  const handleMlConnect = async () => {
    try {
        const data = await mlIntegrationApi.getAuthUrl();
        window.location.href = data.auth_url;
    } catch (error: any) {
        toast.error(handleApiError(error));
    }
  };

  const handleMlDisconnect = async (integrationId: number) => {
    if (!confirm('Tem certeza que deseja desconectar esta conta do Mercado Livre?')) {
        return;
    }
    try {
        await mlIntegrationApi.deleteIntegration(integrationId);
        toast.success('Conta ML desconectada com sucesso!');
        loadMlIntegrations();
    } catch (error: any) {
        toast.error(handleApiError(error));
    }
  };

  const handleConnect = (marketplaceName: string) => {
    if(marketplaceName === 'Mercado Livre') {
        handleMlConnect();
        return;
    }
    window.location.href = `/integrations/new?marketplace=${marketplaceName.toLowerCase().replace(' ', '-')}`;
  };

  const handleDisconnect = async (marketplaceName: string, mlIntegrationId?: number) => {
      if(marketplaceName === 'Mercado Livre' && mlIntegrationId) {
        await handleMlDisconnect(mlIntegrationId);
        return;
    }
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
      <div className="space-y-8">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
                🔗 Integrações com Marketplaces
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Conecte seus marketplaces favoritos e sincronize produtos, estoque e pedidos automaticamente em tempo real
              </p>
              <div className="mt-4 flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-100">Marketplaces Disponíveis</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-xs text-blue-100">Contas Conectadas</p>
                  <p className="text-2xl font-bold">{mlIntegrations.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {marketplaces.map((marketplace) => {
            const isMercadoLivre = marketplace.marketplace_id === 'mercadolivre';
            const mlConnected = isMercadoLivre && mlIntegrations.length > 0;

            return (
              <MarketplaceCard
                key={marketplace.name}
                marketplace={marketplace}
                isConnected={
                  isMercadoLivre
                    ? mlConnected
                    : integrations.some((integration) => integration.marketplace === marketplace.marketplace_id)
                }
                onConnect={() => handleConnect(marketplace.name)}
                onDisconnect={() => handleDisconnect(
                  marketplace.name,
                  isMercadoLivre ? mlIntegrations[0]?.id : undefined
                )}
                mlIntegrations={isMercadoLivre ? mlIntegrations : undefined}
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
