import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

interface MarketplaceCardProps {
  marketplace: {
    name: string;
    logo: string;
    color: string;
  };
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  marketplace,
  isConnected,
  onConnect,
  onDisconnect,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300" style={{ borderColor: marketplace.color }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src={marketplace.logo} alt={`${marketplace.name} logo`} width={40} height={40} />
          <CardTitle>{marketplace.name}</CardTitle>
        </div>
        {isConnected && <CheckCircle className="h-6 w-6 text-green-500" />}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isConnected ? (
          <Button variant="destructive" onClick={onDisconnect} className="w-full">
            Disconnect
          </Button>
        ) : (
          <Button style={{ backgroundColor: marketplace.color }} onClick={onConnect} className="w-full text-white">
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceCard;
