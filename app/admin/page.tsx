'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  CreditCard,
  TrendingUp,
  Clock,
  Shield,
  Search,
  ChevronRight,
  Eye,
  Edit,
  UserCog
} from 'lucide-react'
import { toast } from 'react-toastify'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AdminStats {
  total_users: number
  active_users: number
  trial_users: number
  paying_users: number
  admin_users: number
  total_revenue: number
  monthly_revenue: number
}

interface UserListItem {
  id: number
  email: string
  name: string
  role: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  subscription_status: string
  subscription_plan: string | null
  trial_ends_at: string | null
  subscription_expires_at: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const pageSize = 20

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [user, router])

  useEffect(() => {
    loadUsers()
  }, [searchQuery, roleFilter, subscriptionFilter, currentPage])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [statsData] = await Promise.all([
        adminApi.getStats()
      ])
      setStats(statsData)
    } catch (error: any) {
      toast.error('Erro ao carregar dados do admin')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers({
        skip: currentPage * pageSize,
        limit: pageSize,
        role: roleFilter || undefined,
        subscription_status: subscriptionFilter || undefined,
        search: searchQuery || undefined
      })
      setUsers(response.items)
      setTotalUsers(response.total)
    } catch (error: any) {
      console.error('Error loading users:', error)
    }
  }

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole })
      toast.success('Role atualizada com sucesso')
      loadUsers()
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar role')
    }
  }

  const handleToggleUserActive = async (userId: number, isActive: boolean) => {
    try {
      await adminApi.updateUser(userId, { is_active: !isActive })
      toast.success(isActive ? 'Usuario desativado' : 'Usuario ativado')
      loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar usuario')
    }
  }

  const handleExtendTrial = async (userId: number) => {
    try {
      await adminApi.extendUserTrial(userId, 7)
      toast.success('Trial estendido por 7 dias')
      loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao estender trial')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      no_subscription: 'bg-gray-100 text-gray-500'
    }

    const labels: Record<string, string> = {
      trial: 'Trial',
      active: 'Ativo',
      cancelled: 'Cancelado',
      expired: 'Expirado',
      no_subscription: 'Sem Assinatura'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || statusConfig.no_subscription}`}>
        {labels[status] || status}
      </span>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500">Voce nao tem permissao para acessar esta pagina.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin
          </span>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Usuarios</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usuarios Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Em Trial</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.trial_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pagantes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.paying_users}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue Stats */}
        {stats && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Receita Mensal</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.monthly_revenue)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todas as Roles</option>
                <option value="admin">Admin</option>
                <option value="user">Usuario</option>
              </select>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={subscriptionFilter}
                onChange={(e) => setSubscriptionFilter(e.target.value)}
              >
                <option value="">Todas as Assinaturas</option>
                <option value="trial">Trial</option>
                <option value="active">Ativo</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Assinatura</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Criado em</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{userItem.name}</p>
                          <p className="text-sm text-gray-500">{userItem.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userItem.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(userItem.subscription_status)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(userItem.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/users/${userItem.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {userItem.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateUserRole(userItem.id, 'admin')}
                              title="Tornar Admin"
                            >
                              <UserCog className="h-4 w-4" />
                            </Button>
                          )}
                          {userItem.subscription_status === 'trial' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExtendTrial(userItem.id)}
                              title="Estender Trial"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className={userItem.is_active ? 'text-red-600' : 'text-green-600'}
                            onClick={() => handleToggleUserActive(userItem.id, userItem.is_active)}
                          >
                            {userItem.is_active ? 'Desativar' : 'Ativar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalUsers)} de {totalUsers} usuarios
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(currentPage + 1) * pageSize >= totalUsers}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
