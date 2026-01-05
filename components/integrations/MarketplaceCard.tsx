import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lock, Sparkles } from 'lucide-react';

interface MarketplaceCardProps {
  marketplace: {
    name: string;
    emoji: string;
    color: string;
    textColor: string;
    marketplace_id: string;
    available: boolean;
    description: string;
  };
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  mlIntegrations?: any[];
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  marketplace,
  isConnected,
  onConnect,
  onDisconnect,
  mlIntegrations,
}) => {
  const isMercadoLivre = marketplace.marketplace_id === 'mercadolivre';

  // Card para ML com múltiplas contas conectadas
  if (isMercadoLivre && mlIntegrations && mlIntegrations.length > 0) {
    return (
      <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 animate-pulse-subtle"
            style={{ borderColor: marketplace.color }}>
        {/* Badge de conectado */}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Conectado
        </div>

        <CardHeader className="bg-gradient-to-br from-yellow-50 to-yellow-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="text-5xl">{marketplace.emoji}</div>
            <div>
              <CardTitle className="text-lg" style={{ color: marketplace.textColor }}>{marketplace.name}</CardTitle>
              <p className="text-xs text-gray-600 mt-1">{mlIntegrations.length} conta(s) ativa(s)</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col space-y-2 pt-4">
          {mlIntegrations.map((integration, index) => (
            <div key={integration.id} className="flex flex-col p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-xs font-semibold text-gray-700">
                    Conta {index + 1}
                  </span>
                  <p className="text-xs text-gray-500">ID: {integration.external_user_id}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDisconnect();
                  }}
                  className="text-xs"
                >
                  Remover
                </Button>
              </div>
              {integration.token_expires_at && (
                <div className="flex items-center gap-1 mt-2">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-gray-500">
                    Expira: {new Date(integration.token_expires_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          ))}
          <Button
            style={{ backgroundColor: marketplace.color, color: marketplace.textColor }}
            onClick={onConnect}
            className="w-full mt-2 font-semibold hover:opacity-90 transition-opacity"
          >
            + Adicionar Conta
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Card para ML disponível mas não conectado
  if (isMercadoLivre && marketplace.available) {
    return (
      <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 cursor-pointer group"
            style={{ borderColor: marketplace.color }}>
        {/* Badge de disponível */}
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <span className="h-2 w-2 bg-white rounded-full"></span>
          Disponível
        </div>

        <CardHeader className="bg-gradient-to-br from-yellow-50 to-yellow-100 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
              {marketplace.emoji}
            </div>
            <CardTitle className="text-xl" style={{ color: marketplace.textColor }}>
              {marketplace.name}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">{marketplace.description}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <Button
            style={{ backgroundColor: marketplace.color, color: marketplace.textColor }}
            onClick={onConnect}
            className="w-full font-semibold text-lg py-6 hover:opacity-90 transition-opacity"
          >
            Conectar Agora
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Card para marketplaces não disponíveis
  if (!marketplace.available) {
    return (
      <Card className="relative overflow-hidden border-2 border-gray-200 opacity-60 cursor-not-allowed">
        {/* Badge de em breve */}
        <div className="absolute top-2 right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Em Breve
        </div>

        <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl mb-2 grayscale opacity-50">
              {marketplace.emoji}
            </div>
            <CardTitle className="text-xl text-gray-500">
              {marketplace.name}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-2">{marketplace.description}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <Button
            disabled
            className="w-full font-semibold text-lg py-6 bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            Indisponível
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Card padrão para outros marketplaces disponíveis
  return (
    <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2"
          style={{ borderColor: marketplace.color }}>
      {isConnected && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Conectado
        </div>
      )}

      <CardHeader className="bg-gradient-to-br"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${marketplace.color}20, ${marketplace.color}10)`
                  }}>
        <div className="flex flex-col items-center text-center">
          <div className="text-6xl mb-2">{marketplace.emoji}</div>
          <CardTitle className="text-xl">{marketplace.name}</CardTitle>
          <p className="text-sm text-gray-600 mt-2">{marketplace.description}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isConnected ? (
          <Button
            variant="destructive"
            onClick={onDisconnect}
            className="w-full font-semibold text-lg py-6"
          >
            Desconectar
          </Button>
        ) : (
          <Button
            style={{ backgroundColor: marketplace.color, color: marketplace.textColor }}
            onClick={onConnect}
            className="w-full font-semibold text-lg py-6 hover:opacity-90"
          >
            Conectar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketplaceCard;
