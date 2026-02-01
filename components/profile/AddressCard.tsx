import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addressesApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import {
  MapPin,
  Star,
  Edit,
  Trash2,
  Phone,
  User,
  Loader2,
} from 'lucide-react';
import AddressModal from './AddressModal';

interface AddressCardProps {
  address: any;
  onUpdate: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este endereço?')) {
      return;
    }

    setLoading(true);
    try {
      await addressesApi.delete(address.id);
      toast.success('Endereço removido com sucesso!');
      onUpdate();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async () => {
    setSettingDefault(true);
    try {
      await addressesApi.setDefault(address.id);
      toast.success('Endereço padrão atualizado!');
      onUpdate();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setSettingDefault(false);
    }
  };

  return (
    <>
      <div
        className={`relative p-4 rounded-lg border-2 transition-all ${
          address.is_default
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {/* Badge de Endereço Padrão */}
        {address.is_default && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
              <Star className="h-3 w-3 fill-current" />
              PADRÃO
            </div>
          </div>
        )}

        {/* Label do Endereço */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-lg">{address.label}</h3>
        </div>

        {/* Endereço Completo */}
        <div className="text-sm text-gray-700 space-y-1 mb-3">
          <p>
            {address.street}, {address.number}
            {address.complement && ` - ${address.complement}`}
          </p>
          <p>{address.neighborhood}</p>
          <p>
            {address.city} - {address.state}
          </p>
          <p className="font-medium">CEP: {address.zip_code}</p>
        </div>

        {/* Informações Adicionais */}
        {(address.phone || address.recipient_name) && (
          <div className="text-sm text-gray-600 space-y-1 mb-3 pt-2 border-t">
            {address.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{address.phone}</span>
              </div>
            )}
            {address.recipient_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Para: {address.recipient_name}</span>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-3 border-t">
          {!address.is_default && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetDefault}
              disabled={settingDefault}
              className="flex-1"
            >
              {settingDefault ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Star className="h-4 w-4 mr-1" />
                  Tornar Padrão
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Edição */}
      <AddressModal
        open={showModal}
        onClose={() => setShowModal(false)}
        address={address}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default AddressCard;
