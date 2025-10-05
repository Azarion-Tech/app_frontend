'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { productsApi, handleApiError } from '@/lib/api'
import { Product } from '@/types'
import { formatCurrency, formatNumber, formatDate, getStatusColor } from '@/lib/utils'
import { ArrowLeft, Edit, Trash2, Package } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await productsApi.getById(parseInt(id))
      setProduct(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsApi.delete(parseInt(id))
        toast.success('Produto excluído com sucesso!')
        router.push('/products')
      } catch (error: any) {
        toast.error(handleApiError(error))
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Produto não encontrado
          </h3>
          <Link href="/products">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Produtos
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="mt-1 text-sm text-gray-500">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Product Image */}
          {product.image_url && (
            <Card className="lg:col-span-1">
              <CardContent className="p-6">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'https://via.placeholder.com/400x400?text=Sem+Imagem'
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card className={product.image_url ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Produto</CardTitle>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.is_active ? 'active' : 'inactive')}`}>
                  {product.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Preço</p>
                  <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estoque</p>
                  <p className={`text-lg font-semibold ${
                    product.stock_quantity === 0 ? 'text-red-600' :
                    product.stock_quantity <= 5 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {formatNumber(product.stock_quantity)} unidades
                  </p>
                </div>
                {product.category && (
                  <div>
                    <p className="text-sm text-gray-500">Categoria</p>
                    <p className="text-lg font-semibold">{product.category}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Valor Total em Estoque</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(product.price * product.stock_quantity)}
                  </p>
                </div>
              </div>

              {product.description && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Descrição</p>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Criado em</p>
                  <p className="text-sm font-medium">{formatDate(product.created_at)}</p>
                </div>
                {product.updated_at && (
                  <div>
                    <p className="text-sm text-gray-500">Última atualização</p>
                    <p className="text-sm font-medium">{formatDate(product.updated_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">ID do Produto</span>
              <span className="font-medium">{product.id}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600">Proprietário</span>
              <span className="font-medium">ID: {product.owner_id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
