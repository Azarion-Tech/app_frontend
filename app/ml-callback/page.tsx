'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mlIntegrationApi, handleApiError } from '@/lib/api'
import { toast } from 'react-toastify'

export default function MLCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Processando conexão com Mercado Livre...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Pegar seller_id da URL
        const seller_id = searchParams.get('seller_id') || searchParams.get('user_id')

        if (!seller_id) {
          setStatus('error')
          setMessage('Seller ID não retornado do Mercado Livre')
          toast.error('Erro: Seller ID não encontrado')
          setTimeout(() => router.push('/integrations'), 3000)
          return
        }

        setMessage('Buscando dados do token...')

        // Buscar tokens da API do Render
        const mlApiUrl = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8001'
        const response = await fetch(`${mlApiUrl}/auth/user/${seller_id}`)

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do token')
        }

        const tokenData = await response.json()

        setMessage('Salvando integração...')

        // Enviar para backend main salvar
        await mlIntegrationApi.saveIntegration({
          seller_id: tokenData.seller_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || '',
          expires_in: parseInt(tokenData.expires_in || '21600')
        })

        setStatus('success')
        setMessage('Mercado Livre conectado com sucesso!')
        toast.success(`Conta ML ${seller_id} conectada!`)

        // Redirecionar para integrations após 2 segundos
        setTimeout(() => router.push('/integrations'), 2000)

      } catch (error: any) {
        console.error('Erro ao processar callback ML:', error)
        setStatus('error')
        setMessage('Erro ao salvar integração')
        toast.error(handleApiError(error))
        setTimeout(() => router.push('/integrations'), 3000)
      }
    }

    processCallback()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Conectando...</h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Sucesso!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Erro</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  )
}
