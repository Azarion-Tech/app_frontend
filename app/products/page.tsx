'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { productsApi, handleApiError } from '@/lib/api'
import { Product } from '@/types'
import { formatCurrency, formatNumber, formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll()
      setProducts(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsApi.delete(id)
        toast.success('Produto excluído com sucesso!')
        loadProducts()
      } catch (error: any) {
        toast.error(handleApiError(error))
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300 h-24 rounded-lg"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie seus produtos e sincronize com marketplaces
            </p>
          </div>
          <Link href="/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar produtos por nome, SKU ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando seu primeiro produto'
                }
              </p>
              {!searchTerm && (
                <Link href="/products/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>SKU: {product.sku}</CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.is_active ? 'active' : 'inactive')}`}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.image_url && (
                    <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Preço:</span>
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Estoque:</span>
                      <span className={`font-medium ${product.stock_quantity === 0 ? 'text-red-600' : product.stock_quantity <= 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {formatNumber(product.stock_quantity)}
                      </span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Categoria:</span>
                        <span className="text-sm">{product.category}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Criado:</span>
                      <span className="text-sm">{formatDate(product.created_at)}</span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-end space-x-2 pt-2">
                    <Link href={`/products/${product.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}