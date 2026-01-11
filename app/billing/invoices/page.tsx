'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillingStore } from '@/stores/billingStore';
import type { IuguInvoice } from '@/types/billing';

export default function InvoicesPage() {
  const router = useRouter();
  const { invoices, loading, error, fetchInvoices, getInvoice } = useBillingStore();
  const [selectedInvoice, setSelectedInvoice] = useState<IuguInvoice | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paga' },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelada' },
      expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expirada' },
      partially_paid: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Parcialmente Paga' },
      refunded: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reembolsada' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = async (invoice: IuguInvoice) => {
    try {
      const fullInvoice = await getInvoice(invoice.id);
      setSelectedInvoice(fullInvoice);
      setShowDetailsModal(true);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleCopyPixCode = (pixCode: string) => {
    navigator.clipboard.writeText(pixCode);
    alert('Código PIX copiado!');
  };

  const handleCopyBoletoCode = (boletoCode: string) => {
    navigator.clipboard.writeText(boletoCode);
    alert('Código do boleto copiado!');
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando faturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Faturas</h1>
          <p className="text-gray-600">Histórico de pagamentos e cobranças</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Invoices Table */}
        {invoices.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatPrice(invoice.total_cents)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* No Invoices */
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma fatura encontrada</h3>
            <p className="text-gray-600">Você ainda não possui faturas</p>
          </div>
        )}

        {/* Invoice Details Modal */}
        {showDetailsModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Fatura #{selectedInvoice.id}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedInvoice.iugu_id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedInvoice(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Invoice Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatPrice(selectedInvoice.total_cents)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Data de Emissão</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(selectedInvoice.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(selectedInvoice.due_date)}
                  </p>
                </div>

                {selectedInvoice.paid_at && (
                  <div>
                    <p className="text-sm text-gray-600">Data de Pagamento</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(selectedInvoice.paid_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              {selectedInvoice.status === 'pending' && (
                <div className="space-y-4 mb-6">
                  {/* PIX Payment */}
                  {selectedInvoice.pix_qrcode && (
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      <h4 className="font-semibold text-gray-900 mb-3">Pagar com PIX</h4>

                      {selectedInvoice.pix_qrcode && (
                        <div className="text-center mb-3">
                          <img
                            src={selectedInvoice.pix_qrcode}
                            alt="QR Code PIX"
                            className="mx-auto max-w-[200px]"
                          />
                        </div>
                      )}

                      {selectedInvoice.pix_qrcode_text && (
                        <div>
                          <p className="text-sm text-gray-700 mb-2">Ou copie o código PIX:</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedInvoice.pix_qrcode_text}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => handleCopyPixCode(selectedInvoice.pix_qrcode_text!)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Boleto Payment */}
                  {selectedInvoice.bank_slip_digitable_line && (
                    <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                      <h4 className="font-semibold text-gray-900 mb-3">Pagar com Boleto</h4>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700 mb-2">Linha digitável:</p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={selectedInvoice.bank_slip_digitable_line}
                              readOnly
                              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() =>
                                handleCopyBoletoCode(selectedInvoice.bank_slip_digitable_line!)
                              }
                              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>

                        {selectedInvoice.bank_slip_pdf_url && (
                          <a
                            href={selectedInvoice.bank_slip_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                          >
                            Baixar Boleto PDF
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Secure URL */}
                  {selectedInvoice.secure_url && (
                    <div className="text-center">
                      <a
                        href={selectedInvoice.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                      >
                        Abrir Página de Pagamento
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInvoice(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/billing/subscriptions')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar para Assinaturas
          </button>
        </div>
      </div>
    </div>
  );
}
