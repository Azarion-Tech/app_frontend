import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addressesApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import { Loader2, Search } from 'lucide-react';

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  address?: any; // Se fornecido, está editando
  onSuccess: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  open,
  onClose,
  address,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [searchingCep, setSearchingCep] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'BR',
    phone: '',
    recipient_name: '',
    is_default: false,
  });

  const isEdit = !!address;

  // Preencher formulário ao editar
  useEffect(() => {
    if (open && address) {
      setFormData({
        label: address.label || '',
        zip_code: address.zip_code || '',
        street: address.street || '',
        number: address.number || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || '',
        country: address.country || 'BR',
        phone: address.phone || '',
        recipient_name: address.recipient_name || '',
        is_default: address.is_default || false,
      });
    } else if (open && !address) {
      // Reset ao criar novo
      setFormData({
        label: '',
        zip_code: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        country: 'BR',
        phone: '',
        recipient_name: '',
        is_default: false,
      });
    }
  }, [open, address]);

  const handleCepSearch = async () => {
    const cleanCep = formData.zip_code.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setSearchingCep(true);
    try {
      const data = await addressesApi.searchCep(cleanCep);

      setFormData({
        ...formData,
        street: data.street || '',
        neighborhood: data.neighborhood || '',
        city: data.city || '',
        state: data.state || '',
        complement: data.complement || formData.complement,
      });

      toast.success('CEP encontrado!');
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setSearchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.label.trim()) {
      toast.error('Dê um nome ao endereço (ex: Casa, Trabalho)');
      return;
    }

    if (!formData.zip_code.trim() || !formData.street.trim() || !formData.number.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await addressesApi.update(address.id, formData);
        toast.success('Endereço atualizado com sucesso!');
      } else {
        await addressesApi.create(formData);
        toast.success('Endereço cadastrado com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 5) return clean;
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Endereço' : 'Novo Endereço'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize as informações do seu endereço.'
              : 'Cadastre um novo endereço para entregas e marketplace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nome do Endereço */}
            <div className="grid gap-2">
              <Label htmlFor="label">
                Nome do Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Casa, Trabalho, Estoque Principal"
                required
              />
            </div>

            {/* CEP com busca */}
            <div className="grid gap-2">
              <Label htmlFor="zip_code">
                CEP <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: formatCep(e.target.value) })
                  }
                  placeholder="12345-678"
                  maxLength={9}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCepSearch}
                  disabled={searchingCep || formData.zip_code.replace(/\D/g, '').length !== 8}
                >
                  {searchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">Clique na lupa para buscar o CEP</p>
            </div>

            {/* Rua e Número */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="street">
                  Rua/Avenida <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Nome da rua"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">
                  Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            {/* Complemento */}
            <div className="grid gap-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                placeholder="Apto, Sala, Bloco..."
              />
            </div>

            {/* Bairro */}
            <div className="grid gap-2">
              <Label htmlFor="neighborhood">
                Bairro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) =>
                  setFormData({ ...formData, neighborhood: e.target.value })
                }
                placeholder="Nome do bairro"
                required
              />
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 grid gap-2">
                <Label htmlFor="city">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Nome da cidade"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">
                  UF <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value.toUpperCase() })
                  }
                  placeholder="SP"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone para Contato</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 98765-4321"
              />
            </div>

            {/* Nome do Destinatário */}
            <div className="grid gap-2">
              <Label htmlFor="recipient_name">Nome do Destinatário</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
                placeholder="Deixe vazio para usar seu nome"
              />
              <p className="text-xs text-gray-500">
                Útil se o endereço é de outra pessoa
              </p>
            </div>

            {/* Endereço Padrão */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({ ...formData, is_default: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Definir como endereço padrão
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Salvando...' : 'Cadastrando...'}
                </>
              ) : (
                <>{isEdit ? 'Salvar' : 'Cadastrar'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressModal;
