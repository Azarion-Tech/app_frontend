'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MarketplaceCard from '@/components/integrations/MarketplaceCard';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-toastify';

const marketplaces = [
  {
    name: 'Mercado Livre',
    logo: 'https://www.logosvg.com.br/logos/mercado-livre-88.svg',
    color: '#FFE600',
  },
  {
    name: 'Amazon',
    logo: 'https://www.logosvg.com.br/logos/amazon-2.svg',
    color: '#FF9900',
  },
  {
    name: 'Magazine Luiza',
    logo: 'https://images.seeklogo.com/logo-png/45/1/magalu-logo-png_seeklogo-452237.png',
    color: '#0086FF',
  },
  {
    name: 'Shopee',
    logo: 'https://images.seeklogo.com/logo-png/32/1/shopee-logo-png_seeklogo-326282.png',
    color: '#EE4D2D',
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connectedMarketplaces, setConnectedMarketplaces] = useState<string[]>([]);

  useEffect(() => {
    const connectedMarketplace = searchParams.get('connected');
    if (connectedMarketplace && !connectedMarketplaces.includes(connectedMarketplace)) {
      setConnectedMarketplaces([...connectedMarketplaces, connectedMarketplace]);
      toast.success(`Successfully connected to ${connectedMarketplace}!`);
    }
  }, [searchParams, connectedMarketplaces]);

  const handleConnect = (marketplaceName: string) => {
    router.push(`/integrations/connect/${marketplaceName.toLowerCase().replace(' ', '-')}`);
  };

  const handleDisconnect = (marketplaceName: string) => {
    setConnectedMarketplaces(
      connectedMarketplaces.filter((name) => name !== marketplaceName)
    );
    toast.info(`Disconnected from ${marketplaceName}.`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {marketplaces.map((marketplace) => (
            <MarketplaceCard
              key={marketplace.name}
              marketplace={marketplace}
              isConnected={connectedMarketplaces.includes(marketplace.name)}
              onConnect={() => handleConnect(marketplace.name)}
              onDisconnect={() => handleDisconnect(marketplace.name)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
