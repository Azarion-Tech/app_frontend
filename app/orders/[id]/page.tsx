'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ordersApi, handleApiError } from '@/lib/api'
import { Order } from '@/types'
import { formatCurrency, formatNumber, formatDate, getStatusColor, getStatusText } from '@/lib/utils'
import { ArrowLeft, Package, Truck, MapPin, DollarSign, ShoppingCart } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      const data = await ordersApi.getById(parseInt(id))
      setOrder(data)
    } catch (error: any) {
      toast.error(handleApiError(error))
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return

    setUpdating(true)
    try {
      await ordersApi.updateStatus(order.id, { status: newStatus })
      toast.success('Status atualizado com sucesso!')
      loadOrder()
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order || !confirm('Tem certeza que deseja cancelar este pedido?')) return

    setUpdating(true)
    try {
      await handleStatusUpdate('cancelled')
    } finally {
      setUpdating(false)
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

  if (!order) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pedido não encontrado
          </h3>
          <Link href="/orders">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Pedidos
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const statusActions = [
    { value: 'confirmed', label: 'Confirmar', visible: order.status === 'pending' },
    { value: 'shipped', label: 'Marcar como Enviado', visible: order.status === 'confirmed' },
    { value: 'delivered', label: 'Marcar como Entregue', visible: order.status === 'shipped' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido {order.order_number}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Criado em {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            {order.marketplace && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {order.marketplace}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Actions */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {statusActions
                  .filter(action => action.visible)
                  .map(action => (
                    <Button
                      key={action.value}
                      onClick={() => handleStatusUpdate(action.value)}
                      disabled={updating}
                    >
                      {action.label}
                    </Button>
                  ))}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancelar Pedido
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              {order.customer_email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              )}
              {order.customer_document && (
                <div>
                  <p className="text-sm text-gray-500">Documento</p>
                  <p className="font-medium">{order.customer_document}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && (
                  <p className="text-gray-600">{order.shipping_address_line2}</p>
                )}
                <p className="text-gray-600">
                  {order.shipping_city}, {order.shipping_state}
                </p>
                <p className="text-gray-600">{order.shipping_zipcode}</p>
                <p className="text-gray-600">{order.shipping_country}</p>
              </div>
              {order.tracking_code && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">Código de Rastreio</p>
                  <p className="font-medium">{order.tracking_code}</p>
                  {order.shipping_carrier && (
                    <p className="text-sm text-gray-500">{order.shipping_carrier}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos</span>
                  <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">{formatCurrency(order.total_amount)}</span>
              </div>
              {order.marketplace_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
                  <span>Taxa do Marketplace</span>
                  <span>-{formatCurrency(order.marketplace_fee)}</span>
                </div>
              )}
              {order.payment_fee > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Taxa de Pagamento</span>
                  <span>-{formatCurrency(order.payment_fee)}</span>
                </div>
              )}
              {order.net_amount && (
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Valor Líquido</span>
                  <span className="text-green-600">{formatCurrency(order.net_amount)}</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                  Pagamento: {getStatusText(order.payment_status)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
              <CardDescription>
                {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 flex-1">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                        {item.marketplace_item_id && (
                          <p className="text-xs text-gray-400">
                            ID Marketplace: {item.marketplace_item_id}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatNumber(item.quantity)} x {formatCurrency(item.unit_price)}
                      </p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
