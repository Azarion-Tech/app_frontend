import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { mlProductsApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import {
  CheckCircle2,
  Upload,
  ExternalLink,
  RefreshCw,
  Trash2,
  Settings,
  ChevronDown,
  Loader2
} from 'lucide-react';
import MarketplaceProductModal from './MarketplaceProductModal';

interface MarketplaceSyncButtonProps {
  marketplace: {
    marketplace: string;
    synced: boolean;
    externalId?: string;
    externalUrl?: string;
  };
  productId: number;
  productData: {
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    description?: string;
    image_url?: string;
  };
  onSyncComplete: () => void;
}

const MarketplaceSyncButton: React.FC<MarketplaceSyncButtonProps> = ({
  marketplace,
  productId,
  productData,
  onSyncComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const getMarketplaceEmoji = (mp: string) => {
    switch (mp) {
      case 'mercadolivre':
        return '🛒';
      case 'amazon':
        return '📦';
      case 'magalu':
        return '🏪';
      case 'shopee':
        return '🛍️';
      default:
        return '🔗';
    }
  };

  const getMarketplaceName = (mp: string) => {
    switch (mp) {
      case 'mercadolivre':
        return 'Mercado Livre';
      case 'amazon':
        return 'Amazon';
      case 'magalu':
        return 'Magazine Luiza';
      case 'shopee':
        return 'Shopee';
      default:
        return mp;
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await mlProductsApi.syncProduct(productId);
      toast.success(result.message || 'Produto sincronizado!');
      onSyncComplete();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUnsync = async () => {
    if (!confirm('Deseja remover este produto do marketplace? O anúncio será fechado.')) {
      return;
    }

    setLoading(true);
    try {
      await mlProductsApi.unsyncProduct(productId);
      toast.success('Produto removido do marketplace!');
      onSyncComplete();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInMarketplace = () => {
    if (marketplace.externalUrl) {
      window.open(marketplace.externalUrl, '_blank');
    } else if (marketplace.externalId) {
      // Construir URL baseado no marketplace
      const baseUrls: Record<string, string> = {
        mercadolivre: 'https://produto.mercadolivre.com.br',
      };
      const baseUrl = baseUrls[marketplace.marketplace];
      if (baseUrl) {
        window.open(`${baseUrl}/${marketplace.externalId}`, '_blank');
      }
    }
  };

  // Botão para produto NÃO sincronizado
  if (!marketplace.synced) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="hover:bg-blue-50"
          title={`Sincronizar com ${getMarketplaceName(marketplace.marketplace)}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {getMarketplaceEmoji(marketplace.marketplace)}
              <Upload className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>

        <MarketplaceProductModal
          open={showModal}
          onClose={() => setShowModal(false)}
          marketplace={marketplace.marketplace}
          productId={productId}
          productData={productData}
          onSyncComplete={() => {
            setShowModal(false);
            onSyncComplete();
          }}
        />
      </>
    );
  }

  // Dropdown para produto SINCRONIZADO
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="default"
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {getMarketplaceEmoji(marketplace.marketplace)}
              <CheckCircle2 className="h-3 w-3 ml-1" />
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {getMarketplaceName(marketplace.marketplace)}
        </div>
        {marketplace.externalId && (
          <div className="px-2 py-1 text-xs text-gray-500">
            ID: {marketplace.externalId}
          </div>
        )}
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleOpenInMarketplace}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver anúncio no marketplace
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleSync}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar dados
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setShowModal(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configurar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleUnsync}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Remover sincronização
        </DropdownMenuItem>
      </DropdownMenuContent>

      <MarketplaceProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        marketplace={marketplace.marketplace}
        productId={productId}
        productData={productData}
        existingData={{
          externalId: marketplace.externalId,
          externalUrl: marketplace.externalUrl,
        }}
        onSyncComplete={() => {
          setShowModal(false);
          onSyncComplete();
        }}
      />
    </DropdownMenu>
  );
};

export default MarketplaceSyncButton;
