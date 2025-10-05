'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { productsApi, handleApiError } from '@/lib/api'
import { Product } from '@/types'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().max(2000).optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  stock_quantity: z.string(),
  category: z.string().max(100).optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  is_active: z.boolean(),
})

type ProductForm = z.infer<typeof productSchema>

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await productsApi.getById(parseInt(id))
      setProduct(data)

      // Reset form with product data
      reset({
        name: data.name,
        description: data.description || '',
        price: data.price.toString(),
        stock_quantity: data.stock_quantity.toString(),
        category: data.category || '',
        image_url: data.image_url || '',
        is_active: data.is_active,
      })
    } catch (error: any) {
      toast.error(handleApiError(error))
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true)
    try {
      const productData = {
        name: data.name,
        description: data.description || undefined,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity),
        category: data.category || undefined,
        image_url: data.image_url || undefined,
        is_active: data.is_active,
      }

      await productsApi.update(parseInt(id), productData)
      toast.success('Produto atualizado com sucesso!')
      router.push(`/products/${id}`)
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
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
        <div className="flex items-center space-x-4">
          <Link href={`/products/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
            <p className="mt-1 text-sm text-gray-500">
              Atualize as informações do produto
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Edite os campos abaixo para atualizar o produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome do Produto *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <Input
                    id="category"
                    type="text"
                    {...register('category')}
                    className="mt-1"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Preço (R$) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    className="mt-1"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700">
                    Quantidade em Estoque *
                  </label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    {...register('stock_quantity')}
                    className="mt-1"
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                    URL da Imagem
                  </label>
                  <Input
                    id="image_url"
                    type="url"
                    {...register('image_url')}
                    className="mt-1"
                  />
                  {errors.image_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      type="checkbox"
                      {...register('is_active')}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Produto ativo
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link href={`/products/${id}`}>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
