import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { addressesApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import { Plus, Loader2, MapPinned } from 'lucide-react';
import AddressCard from './AddressCard';
import AddressModal from './AddressModal';

const AddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressesApi.getAll();
      setAddresses(data.addresses || []);
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meus Endereços</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie seus endereços para entregas e marketplaces
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Endereço
        </Button>
      </div>

      {/* Lista de Endereços */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPinned className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum endereço cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Adicione um endereço para facilitar o envio de produtos e integração com marketplaces
          </p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeiro Endereço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} onUpdate={loadAddresses} />
          ))}
        </div>
      )}

      {/* Modal de Criação */}
      <AddressModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadAddresses}
      />
    </div>
  );
};

export default AddressList;
