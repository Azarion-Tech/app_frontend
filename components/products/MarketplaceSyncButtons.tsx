import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { mlIntegrationApi, mlProductsApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import MarketplaceSyncButton from './MarketplaceSyncButton';

interface MarketplaceSyncButtonsProps {
  productId: number;
  productData: {
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    description?: string;
    image_url?: string;
  };
  onSyncComplete?: () => void;
}

interface MarketplaceStatus {
  marketplace: string;
  connected: boolean;
  synced: boolean;
  externalId?: string;
  loading: boolean;
}

const MarketplaceSyncButtons: React.FC<MarketplaceSyncButtonsProps> = ({
  productId,
  productData,
  onSyncComplete
}) => {
  const [marketplaces, setMarketplaces] = useState<MarketplaceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplaceStatus();
  }, [productId]);

  const loadMarketplaceStatus = async () => {
    try {
      // Buscar integrações conectadas
      const { integrations } = await mlIntegrationApi.listIntegrations();

      if (integrations.length === 0) {
        setMarketplaces([]);
        setLoading(false);
        return;
      }

      // Buscar status de sincronização do produto
      const syncStatus = await mlProductsApi.getSyncStatus(productId);

      // Para cada integração, verificar status
      const statuses: MarketplaceStatus[] = [];

      for (const integration of integrations) {
        const marketplace = syncStatus.marketplaces.find(
          (m: any) => m.marketplace === integration.marketplace
        );

        statuses.push({
          marketplace: integration.marketplace,
          connected: true,
          synced: marketplace?.synced || false,
          externalId: marketplace?.external_id,
          loading: false
        });
      }

      setMarketplaces(statuses);
    } catch (error: any) {
      console.error('Erro ao carregar status dos marketplaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (marketplaces.length === 0) {
    return (
      <div className="flex gap-2 items-center">
        <Button
          size="sm"
          variant="outline"
          disabled
          className="opacity-50 cursor-not-allowed"
          title="Conecte o Mercado Livre primeiro em Integrações"
        >
          🛒 Não conectado
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {marketplaces.map((mp) => (
        <MarketplaceSyncButton
          key={mp.marketplace}
          marketplace={mp}
          productId={productId}
          productData={productData}
          onSyncComplete={loadMarketplaceStatus}
        />
      ))}
    </div>
  );
};

export default MarketplaceSyncButtons;
