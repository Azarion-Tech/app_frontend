'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { integrationsApi, handleApiError } from '@/lib/api'
import { ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'
import Link from 'next/link'

const integrationSchema = z.object({
  marketplace: z.string().min(1, 'Marketplace é obrigatório'),
  marketplace_account_id: z.string().optional(),
  api_key: z.string().min(1, 'API Key é obrigatória'),
  api_secret: z.string().optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  sync_frequency: z.string().optional(),
  auto_sync_enabled: z.boolean(),
})

type IntegrationForm = z.infer<typeof integrationSchema>

export default function NewIntegrationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IntegrationForm>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      marketplace: 'mercadolivre',
      auto_sync_enabled: true,
      sync_frequency: 'hourly',
    }
  })

  const selectedMarketplace = watch('marketplace')

  const marketplaces = [
    { value: 'mercadolivre', label: 'Mercado Livre' },
    { value: 'amazon', label: 'Amazon' },
    { value: 'magalu', label: 'Magazine Luiza' },
  ]

  const syncFrequencies = [
    { value: 'manual', label: 'Manual' },
    { value: 'hourly', label: 'A cada hora' },
    { value: 'daily', label: 'Diariamente' },
    { value: 'weekly', label: 'Semanalmente' },
  ]

  const onSubmit = async (data: IntegrationForm) => {
    setIsSubmitting(true)
    try {
      const integrationData = {
        marketplace: data.marketplace,
        marketplace_account_id: data.marketplace_account_id || undefined,
        api_credentials: {
          api_key: data.api_key,
          api_secret: data.api_secret || undefined,
          access_token: data.access_token || undefined,
          refresh_token: data.refresh_token || undefined,
        },
        sync_frequency: data.sync_frequency || undefined,
        auto_sync_enabled: data.auto_sync_enabled,
      }

      await integrationsApi.create(integrationData)
      toast.success('Integração criada com sucesso!')
      router.push('/integrations')
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
          <Link href="/integrations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Integração</h1>
            <p className="mt-1 text-sm text-gray-500">
              Conecte um novo marketplace ao sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Integração</CardTitle>
            <CardDescription>
              Configure as credenciais e preferências de sincronização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="marketplace" className="block text-sm font-medium text-gray-700">
                    Marketplace *
                  </label>
                  <select
                    id="marketplace"
                    {...register('marketplace')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  >
                    {marketplaces.map(mp => (
                      <option key={mp.value} value={mp.value}>
                        {mp.label}
                      </option>
                    ))}
                  </select>
                  {errors.marketplace && (
                    <p className="mt-1 text-sm text-red-600">{errors.marketplace.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="marketplace_account_id" className="block text-sm font-medium text-gray-700">
                    ID da Conta no Marketplace
                  </label>
                  <Input
                    id="marketplace_account_id"
                    type="text"
                    {...register('marketplace_account_id')}
                    className="mt-1"
                    placeholder="Ex: 123456789"
                  />
                  {errors.marketplace_account_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.marketplace_account_id.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
                    API Key *
                  </label>
                  <Input
                    id="api_key"
                    type="text"
                    {...register('api_key')}
                    className="mt-1"
                    placeholder="Sua API Key"
                  />
                  {errors.api_key && (
                    <p className="mt-1 text-sm text-red-600">{errors.api_key.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="api_secret" className="block text-sm font-medium text-gray-700">
                    API Secret
                  </label>
                  <Input
                    id="api_secret"
                    type="password"
                    {...register('api_secret')}
                    className="mt-1"
                    placeholder="Seu API Secret (opcional)"
                  />
                  {errors.api_secret && (
                    <p className="mt-1 text-sm text-red-600">{errors.api_secret.message}</p>
                  )}
                </div>

                {selectedMarketplace === 'mercadolivre' && (
                  <>
                    <div className="sm:col-span-2">
                      <label htmlFor="access_token" className="block text-sm font-medium text-gray-700">
                        Access Token
                      </label>
                      <Input
                        id="access_token"
                        type="text"
                        {...register('access_token')}
                        className="mt-1"
                        placeholder="Access Token do Mercado Livre"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="refresh_token" className="block text-sm font-medium text-gray-700">
                        Refresh Token
                      </label>
                      <Input
                        id="refresh_token"
                        type="text"
                        {...register('refresh_token')}
                        className="mt-1"
                        placeholder="Refresh Token do Mercado Livre"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2 border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Configurações de Sincronização
                  </h3>
                </div>

                <div>
                  <label htmlFor="sync_frequency" className="block text-sm font-medium text-gray-700">
                    Frequência de Sincronização
                  </label>
                  <select
                    id="sync_frequency"
                    {...register('sync_frequency')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  >
                    {syncFrequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    id="auto_sync_enabled"
                    type="checkbox"
                    {...register('auto_sync_enabled')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="auto_sync_enabled" className="ml-2 block text-sm text-gray-900">
                    Habilitar sincronização automática
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Link href="/integrations">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Integração'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Dicas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>• Para obter suas credenciais do Mercado Livre, acesse: https://developers.mercadolivre.com.br</p>
            <p>• Para Amazon, consulte: https://developer.amazon.com</p>
            <p>• As credenciais são criptografadas e armazenadas com segurança</p>
            <p>• Você pode testar a conexão após criar a integração</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
