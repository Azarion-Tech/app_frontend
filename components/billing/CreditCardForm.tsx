'use client';

import { useState } from 'react';
import type { CreditCardData, CreditCardToken } from '@/types/billing';

interface CreditCardFormProps {
  onSuccess: (token: string, brand: string, lastFour: string) => void;
  onError: (error: string) => void;
  loading?: boolean;
}

export default function CreditCardForm({ onSuccess, onError, loading = false }: CreditCardFormProps) {
  const [cardData, setCardData] = useState<CreditCardData>({
    number: '',
    verification_value: '',
    first_name: '',
    last_name: '',
    month: '',
    year: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let formattedValue = value;

    // Format card number (add spaces every 4 digits)
    if (name === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Limit CVV to 3-4 digits
    if (name === 'verification_value') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [name]: formattedValue }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!cardData.verification_value || cardData.verification_value.length < 3) {
      newErrors.verification_value = 'CVV inválido';
    }

    if (!cardData.first_name) {
      newErrors.first_name = 'Nome é obrigatório';
    }

    if (!cardData.last_name) {
      newErrors.last_name = 'Sobrenome é obrigatório';
    }

    if (!cardData.month || parseInt(cardData.month) < 1 || parseInt(cardData.month) > 12) {
      newErrors.month = 'Mês inválido';
    }

    if (!cardData.year || parseInt(cardData.year) < new Date().getFullYear() % 100) {
      newErrors.year = 'Ano inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if iugu.js is loaded
    if (!window.Iugu) {
      onError('Erro ao carregar sistema de pagamento. Recarregue a página.');
      return;
    }

    // Prepare card data for iugu
    const iuguCardData = {
      ...cardData,
      number: cardData.number.replace(/\s/g, ''),
    };

    // Tokenize card with iugu.js
    window.Iugu.createPaymentToken(iuguCardData, (response) => {
      if ('errors' in response) {
        const errorMessages = Object.values(response.errors).join(', ');
        onError(`Erro ao processar cartão: ${errorMessages}`);
      } else {
        const token = response.id;
        const brand = response.extra_info.brand;
        const lastFour = response.data.display_number.slice(-4);

        onSuccess(token, brand, lastFour);
      }
    });
  };

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  // Generate year options (current year + 15 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => {
    const year = currentYear + i;
    return { value: (year % 100).toString().padStart(2, '0'), label: year.toString() };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
          Número do Cartão
        </label>
        <input
          type="text"
          id="number"
          name="number"
          value={cardData.number}
          onChange={handleChange}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.number ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
      </div>

      {/* Cardholder Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={cardData.first_name}
            onChange={handleChange}
            placeholder="João"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Sobrenome
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={cardData.last_name}
            onChange={handleChange}
            placeholder="Silva"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
        </div>
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
            Mês
          </label>
          <select
            id="month"
            name="month"
            value={cardData.month}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.month ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">MM</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Ano
          </label>
          <select
            id="year"
            name="year"
            value={cardData.year}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">AA</option>
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
        </div>

        <div>
          <label htmlFor="verification_value" className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            id="verification_value"
            name="verification_value"
            value={cardData.verification_value}
            onChange={handleChange}
            placeholder="123"
            maxLength={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.verification_value ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.verification_value && (
            <p className="mt-1 text-sm text-red-600">{errors.verification_value}</p>
          )}
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          className="w-5 h-5 text-blue-600 mt-0.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-sm text-blue-800">
          Seus dados são processados de forma segura e criptografada pela iugu.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processando...
          </>
        ) : (
          'Confirmar Pagamento'
        )}
      </button>
    </form>
  );
}
