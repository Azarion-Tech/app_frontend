'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { productsApi, handleApiError } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255),
  description: z.string().max(2000).optional(),
  price: z.string().min(1, 'Preço é obrigatório'),
  stock_quantity: z.string().min(0, 'Quantidade deve ser maior ou igual a 0'),
  sku: z.string().min(1, 'SKU é obrigatório').max(100),
  category: z.string().max(100).optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  gtin_ean: z.string().max(14).optional().or(z.literal('')),
})

type ProductForm = z.infer<typeof productSchema>

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: '0',
      stock_quantity: '0',
    }
  })

  const onSubmit = async (data: ProductForm) => {
    setIsSubmitting(true)
    try {
      const productData = {
        ...data,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity),
        description: data.description || undefined,
        category: data.category || undefined,
        image_url: data.image_url || undefined,
        gtin_ean: data.gtin_ean || undefined,
      }

      await productsApi.create(productData)
      toast.success('Produto criado com sucesso!')
      router.push('/products')
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
            <p className="mt-1 text-sm text-gray-500">
              Adicione um novo produto ao seu catálogo
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para cadastrar um novo produto
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
                    placeholder="Ex: Notebook Dell Inspiron"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU *
                  </label>
                  <Input
                    id="sku"
                    type="text"
                    {...register('sku')}
                    className="mt-1"
                    placeholder="Ex: DELL-NOTE-001"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
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
                    placeholder="Ex: Eletrônicos"
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
                    placeholder="0.00"
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
                    placeholder="0"
                  />
                  {errors.stock_quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock_quantity.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gtin_ean" className="block text-sm font-medium text-gray-700">
                    Código de Barras (GTIN/EAN)
                  </label>
                  <Input
                    id="gtin_ean"
                    type="text"
                    maxLength={14}
                    {...register('gtin_ean')}
                    className="mt-1"
                    placeholder="Ex: 7891234567890"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Código universal do produto (obrigatório para algumas categorias no ML)
                  </p>
                  {errors.gtin_ean && (
                    <p className="mt-1 text-sm text-red-600">{errors.gtin_ean.message}</p>
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
                    placeholder="https://exemplo.com/imagem.jpg"
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
                    placeholder="Descrição detalhada do produto..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Link href="/products">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Produto'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
