"use client";

import React from 'react';
import AddressList from '@/components/profile/AddressList';
import { User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl">
      {/* Header da Página */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações e endereços</p>
          </div>
        </div>
      </div>

      {/* Tabs/Seções (futuramente pode adicionar mais abas) */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
              Endereços
            </button>
            {/* Adicionar mais tabs futuramente:
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Dados Pessoais
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Segurança
            </button>
            */}
          </nav>
        </div>
      </div>

      {/* Conteúdo - Lista de Endereços */}
      <AddressList />
      </div>
    </DashboardLayout>
  );
}
