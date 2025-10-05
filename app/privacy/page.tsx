'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { privacyApi, handleApiError } from '@/lib/api'
import { Shield, Download, Trash2, FileText, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'react-toastify'

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true)
  const [policy, setPolicy] = useState<any>(null)
  const [processingActivities, setProcessingActivities] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadPrivacyData()
  }, [])

  const loadPrivacyData = async () => {
    try {
      const [policyData, activitiesData] = await Promise.all([
        privacyApi.getPolicy(),
        privacyApi.getProcessingActivities(),
      ])
      setPolicy(policyData)
      setProcessingActivities(activitiesData)
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const data = await privacyApi.exportData()

      // Convert to JSON and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-${new Date().toISOString()}.json`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Dados exportados com sucesso!')
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setExporting(false)
    }
  }

  const handleRequestDeletion = async () => {
    if (!confirm(
      'ATENÇÃO: Esta ação solicitará a exclusão permanente de todos os seus dados. ' +
      'Você tem certeza que deseja continuar? Esta ação não pode ser desfeita.'
    )) {
      return
    }

    setDeleting(true)
    try {
      await privacyApi.requestAccountDeletion()
      toast.success(
        'Solicitação de exclusão enviada. Sua conta será excluída em até 30 dias. ' +
        'Você receberá uma confirmação por email.'
      )
    } catch (error: any) {
      toast.error(handleApiError(error))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Privacidade e LGPD</h1>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-300 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Privacidade e LGPD</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus dados pessoais e privacidade de acordo com a LGPD
          </p>
        </div>

        {/* Info Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">
                  Seus direitos sob a LGPD
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                  acessar seus dados, corrigi-los, solicitar a portabilidade e solicitar a
                  exclusão. Esta página permite que você exerça esses direitos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Exportar Meus Dados
            </CardTitle>
            <CardDescription>
              Baixe uma cópia de todos os seus dados pessoais armazenados (Art. 18, LGPD)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Você receberá um arquivo JSON contendo todas as informações que coletamos
              sobre você, incluindo perfil, produtos, pedidos e histórico de atividades.
            </p>
            <Button onClick={handleExportData} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Atividades de Processamento
            </CardTitle>
            <CardDescription>
              Veja como processamos seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processingActivities?.activities && processingActivities.activities.length > 0 ? (
              <div className="space-y-4">
                {processingActivities.activities.map((activity: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{activity.purpose}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activity.data_types?.map((type: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Base legal: {activity.legal_basis}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhuma atividade de processamento registrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        {policy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Política de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {policy.content ? (
                  <div dangerouslySetInnerHTML={{ __html: policy.content }} />
                ) : (
                  <div className="space-y-4 text-sm text-gray-700">
                    <p><strong>Última atualização:</strong> {policy.last_updated || 'N/A'}</p>
                    <p>
                      Esta política de privacidade descreve como coletamos, usamos e protegemos
                      suas informações pessoais de acordo com a LGPD.
                    </p>
                    <h3 className="text-lg font-semibold mt-4">1. Coleta de Dados</h3>
                    <p>
                      Coletamos informações quando você se registra, faz login e usa nossos
                      serviços, incluindo dados de produtos, pedidos e integrações.
                    </p>
                    <h3 className="text-lg font-semibold mt-4">2. Uso de Dados</h3>
                    <p>
                      Usamos seus dados para fornecer e melhorar nossos serviços, processar
                      pedidos e sincronizar com marketplaces.
                    </p>
                    <h3 className="text-lg font-semibold mt-4">3. Compartilhamento</h3>
                    <p>
                      Compartilhamos dados apenas com os marketplaces que você conectar e conforme
                      necessário para operar o serviço.
                    </p>
                    <h3 className="text-lg font-semibold mt-4">4. Segurança</h3>
                    <p>
                      Implementamos medidas de segurança técnicas e organizacionais para proteger
                      seus dados.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam permanentemente sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Excluir Conta e Dados</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Solicita a exclusão permanente de sua conta e todos os dados associados.
                  Esta ação não pode ser desfeita. Você tem o direito à eliminação dos dados
                  pessoais tratados com o seu consentimento (Art. 18, III, LGPD).
                </p>
                <Button
                  variant="outline"
                  onClick={handleRequestDeletion}
                  disabled={deleting}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Processando...' : 'Solicitar Exclusão de Conta'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact DPO */}
        <Card>
          <CardHeader>
            <CardTitle>Contato do Encarregado de Dados (DPO)</CardTitle>
            <CardDescription>
              Entre em contato para exercer seus direitos ou esclarecer dúvidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">
              Email: <a href="mailto:dpo@example.com" className="text-blue-600 hover:underline">
                dpo@example.com
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Responderemos sua solicitação em até 15 dias úteis, conforme a LGPD.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
