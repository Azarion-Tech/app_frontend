'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { integrationsApi, handleApiError, userApi, mlIntegrationApi } from '@/lib/api'
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
  const [mlConnection, setMlConnection] = useState<{ has_access: boolean } | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadIntegrations()
    if (user?.email) {
        loadMlConnection(user.email);
    }
  }, [user])

  const loadMlConnection = async (email: string) => {
    try {
        const data = await userApi.getMlAccess(email);
        setMlConnection(data);
    } catch (error: any) {
        toast.error(handleApiError(error));
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

  const handleConnect = (marketplaceName: string) => {
    if(marketplaceName === 'Mercado Livre') {
        handleMlConnect();
        return;
    }
    window.location.href = `/integrations/new?marketplace=${marketplaceName.toLowerCase().replace(' ', '-')}`;
  };

  const handleDisconnect = async (marketplaceName: string) => {
      if(marketplaceName === 'Mercado Livre') {
        toast.info('A funcionalidade de desconectar o Mercado Livre ainda não foi implementada.');
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
              mlConnection={mlConnection || undefined}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
