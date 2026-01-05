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
import { Textarea } from '@/components/ui/textarea';
import { mlProductsApi, handleApiError } from '@/lib/api';
import { toast } from 'react-toastify';
import { AlertCircle, Loader2, Search, CheckCircle2 } from 'lucide-react';

interface CategorySuggestion {
  category_id: string;
  category_name: string;
  domain_id: string;
  domain_name: string;
}

interface CategoryAttribute {
  id: string;
  name: string;
  value_type: string;
  values?: Array<{ id: string; name: string }>;
  tags?: {
    required?: boolean;
    read_only?: boolean;
  };
}

interface MarketplaceProductModalProps {
  open: boolean;
  onClose: () => void;
  marketplace: string;
  productId: number;
  productData: {
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
    description?: string;
    image_url?: string;
  };
  existingData?: {
    externalId?: string;
    externalUrl?: string;
  };
  onSyncComplete: () => void;
}

const MarketplaceProductModal: React.FC<MarketplaceProductModalProps> = ({
  open,
  onClose,
  marketplace,
  productId,
  productData,
  existingData,
  onSyncComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: productData.name.substring(0, 60),
    price: productData.price,
    quantity: productData.stock_quantity,
    description: productData.description || '',
    categoryId: '',
    categoryName: '',
    condition: 'new' as 'new' | 'used' | 'reconditioned',
    listingType: 'gold_special' as 'free' | 'gold_special' | 'gold_pro',
    buyingMode: 'buy_it_now' as 'buy_it_now' | 'auction' | 'classified',
    attributes: {} as Record<string, string>,
  });

  const isEdit = !!existingData?.externalId;

  // Auto-predict category when modal opens
  useEffect(() => {
    if (open && !isEdit) {
      predictCategory();
    }
  }, [open, isEdit]);

  const predictCategory = async () => {
    setLoadingCategories(true);
    try {
      const response = await mlProductsApi.predictCategory(productData.name);
      setCategorySuggestions(response.suggestions || []);
    } catch (error: any) {
      console.error('Erro ao predizer categoria:', error);
      toast.error('Não foi possível buscar sugestões de categoria');
    } finally {
      setLoadingCategories(false);
    }
  };

  const searchCategories = async () => {
    if (!searchQuery.trim()) {
      toast.error('Digite um termo para buscar');
      return;
    }

    setLoadingCategories(true);
    try {
      const response = await mlProductsApi.searchCategories(searchQuery);
      setSearchResults(response.categories || []);
      if (response.categories.length === 0) {
        toast.info('Nenhuma categoria encontrada');
      }
    } catch (error: any) {
      toast.error(handleApiError(error));
    } finally {
      setLoadingCategories(false);
    }
  };

  const selectCategory = async (categoryId: string, categoryName: string) => {
    setFormData({
      ...formData,
      categoryId,
      categoryName,
      attributes: {} // Reset attributes
    });

    // Fetch category attributes
    setLoadingAttributes(true);
    try {
      const attributes = await mlProductsApi.getCategoryAttributes(categoryId);
      setCategoryAttributes(attributes || []);
    } catch (error: any) {
      console.error('Erro ao buscar atributos:', error);
      toast.warning('Categoria selecionada, mas não foi possível carregar atributos opcionais');
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleAttributeChange = (attrId: string, value: string) => {
    setFormData({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attrId]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && !formData.categoryId) {
      toast.error('Selecione uma categoria do Mercado Livre');
      return;
    }

    // Check required attributes
    const requiredAttrs = categoryAttributes.filter(attr => attr.tags?.required);
    const missingAttrs = requiredAttrs.filter(attr => !formData.attributes[attr.id]);

    if (missingAttrs.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${missingAttrs.map(a => a.name).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        // Update existing product
        await mlProductsApi.syncProduct(productId);
        toast.success('Produto atualizado!');
      } else {
        // Create new product
        await mlProductsApi.createProduct(productId, {
          category_id: formData.categoryId,
          condition: formData.condition,
          listing_type: formData.listingType,
          buying_mode: formData.buyingMode,
          attributes: formData.attributes,
        });
        toast.success('Produto criado no Mercado Livre!');
      }
      onSyncComplete();
      onClose();
    } catch (error: any) {
      const errorMessage = handleApiError(error);

      // Se o erro contém um link (URL), mostrar toast especial com ação
      if (errorMessage.includes('https://')) {
        const urlMatch = errorMessage.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : null;
        const message = errorMessage.replace(/(https?:\/\/[^\s]+)/, '').trim();

        toast.error(
          <div>
            <p>{message}</p>
            {url && (
              <button
                onClick={() => window.open(url, '_blank')}
                className="mt-2 px-3 py-1 bg-white text-red-600 rounded text-sm font-medium hover:bg-red-50"
              >
                Abrir Configurações →
              </button>
            )}
          </div>,
          { autoClose: 10000 }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
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

  const renderAttributeField = (attr: CategoryAttribute) => {
    const isRequired = attr.tags?.required;
    const value = formData.attributes[attr.id] || '';

    // If attribute has predefined values, show select
    if (attr.values && attr.values.length > 0) {
      return (
        <div key={attr.id} className="grid gap-2">
          <Label htmlFor={attr.id} className="font-medium">
            {attr.name}
          </Label>
          <select
            id={attr.id}
            className={`flex h-10 w-full rounded-md border ${
              isRequired ? 'border-red-300 bg-white' : 'border-input bg-background'
            } px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              isRequired ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            value={value}
            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
            required={isRequired}
          >
            <option value="">Selecione...</option>
            {attr.values.map((val) => (
              <option key={val.id} value={val.id}>
                {val.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // Otherwise, show input field
    return (
      <div key={attr.id} className="grid gap-2">
        <Label htmlFor={attr.id} className="font-medium">
          {attr.name}
        </Label>
        <Input
          id={attr.id}
          value={value}
          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
          placeholder={`Digite o ${attr.name.toLowerCase()}`}
          required={isRequired}
          className={isRequired ? 'border-red-300 focus:ring-red-500' : ''}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Configurar' : 'Criar'} Produto no {getMarketplaceName(marketplace)}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Ajuste as informações do produto no marketplace.'
              : 'Preencha as informações necessárias para publicar no marketplace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Categoria (apenas para novos produtos) */}
            {!isEdit && (
              <div className="grid gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    1. Selecione a Categoria
                  </Label>
                  {formData.categoryId && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Selecionada</span>
                    </div>
                  )}
                </div>

                {/* Category Search */}
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar categoria..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchCategories())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={searchCategories}
                    disabled={loadingCategories}
                  >
                    {loadingCategories ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Selected Category */}
                {formData.categoryId && (
                  <div className="p-3 bg-white border border-green-300 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      {formData.categoryName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ID: {formData.categoryId}</p>
                  </div>
                )}

                {/* Category Suggestions */}
                {!formData.categoryId && categorySuggestions.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Sugestões baseadas no título:</p>
                    <div className="space-y-2">
                      {categorySuggestions.slice(0, 3).map((cat) => (
                        <button
                          key={cat.category_id}
                          type="button"
                          onClick={() => selectCategory(cat.category_id, cat.category_name)}
                          className="w-full p-3 text-left bg-white hover:bg-blue-50 border border-gray-200 rounded-md transition-colors"
                        >
                          <p className="text-sm font-medium">{cat.category_name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {cat.domain_name} • ID: {cat.category_id}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Resultados da busca:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => selectCategory(cat.id, cat.name)}
                          className="w-full p-3 text-left bg-white hover:bg-blue-50 border border-gray-200 rounded-md transition-colors"
                        >
                          <p className="text-sm font-medium">{cat.name}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {cat.id}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="grid gap-3">
              <Label className="text-base font-semibold">
                {isEdit ? 'Informações do Produto' : '2. Informações do Produto'}
              </Label>

              {/* Título */}
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Título do Anúncio
                  <span className="text-xs text-gray-500 ml-2">
                    ({formData.title.length}/60)
                  </span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value.substring(0, 60) })
                  }
                  placeholder="Nome do produto"
                  maxLength={60}
                  required
                />
              </div>

              {/* Preço e Quantidade */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              {/* Condição e Tipo de Anúncio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condição</Label>
                  <select
                    id="condition"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        condition: e.target.value as 'new' | 'used' | 'reconditioned',
                      })
                    }
                  >
                    <option value="new">Novo</option>
                    <option value="used">Usado</option>
                    <option value="reconditioned">Recondicionado</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="listingType">Tipo de Anúncio</Label>
                  <select
                    id="listingType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.listingType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listingType: e.target.value as 'free' | 'gold_special' | 'gold_pro',
                      })
                    }
                  >
                    <option value="free">Grátis (Clássico)</option>
                    <option value="gold_special">Premium</option>
                    <option value="gold_pro">Premium Plus</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição detalhada do produto..."
                  rows={4}
                />
              </div>
            </div>

            {/* Category Attributes */}
            {!isEdit && formData.categoryId && categoryAttributes.length > 0 && (
              <div className="grid gap-3">
                <Label className="text-base font-semibold">
                  3. Atributos da Categoria
                </Label>

                {loadingAttributes ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    {/* Required Attributes */}
                    {categoryAttributes.filter(attr => !attr.tags?.read_only && attr.tags?.required).length > 0 && (
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            OBRIGATÓRIO
                          </div>
                          <span className="text-sm font-semibold text-red-900">
                            Campos obrigatórios ({categoryAttributes.filter(attr => !attr.tags?.read_only && attr.tags?.required).length})
                          </span>
                        </div>
                        <div className="grid gap-3">
                          {categoryAttributes
                            .filter(attr => !attr.tags?.read_only && attr.tags?.required)
                            .map(renderAttributeField)}
                        </div>
                      </div>
                    )}

                    {/* Optional Attributes */}
                    {categoryAttributes.filter(attr => !attr.tags?.read_only && !attr.tags?.required).length > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                            OPCIONAL
                          </div>
                          <span className="text-sm font-medium text-blue-900">
                            Campos opcionais ({categoryAttributes.filter(attr => !attr.tags?.read_only && !attr.tags?.required).length})
                          </span>
                        </div>
                        <div className="grid gap-3">
                          {categoryAttributes
                            .filter(attr => !attr.tags?.read_only && !attr.tags?.required)
                            .map(renderAttributeField)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Link do anúncio (se já existe) */}
            {existingData?.externalUrl && (
              <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-900">
                  <p className="font-medium">ID do Anúncio: {existingData.externalId}</p>
                  <a
                    href={existingData.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver anúncio no marketplace →
                  </a>
                </div>
              </div>
            )}

            {/* Alerta para criação */}
            {!isEdit && formData.categoryId && (
              <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Pronto para publicar!</p>
                  <p className="mt-1">
                    Clique em "Criar Anúncio" para publicar seu produto no Mercado Livre.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || (!isEdit && !formData.categoryId)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEdit ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                <>{isEdit ? 'Atualizar' : 'Criar Anúncio'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceProductModal;
