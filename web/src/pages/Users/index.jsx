import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Filter,
  X,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react'

import { api } from '../../services/api'
import { useAuth } from '../../hooks/auth'
import { toastError, toastSuccess } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout'
import { DataTable } from '../../components/DataTable'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Dicionário de tradução e estilos dos perfis
const ROLE_MAP = {
  admin: {
    label: 'Administrador',
    className: 'bg-emerald-600 hover:bg-emerald-700 text-white'
  },
  operator: {
    label: 'Operador',
    className: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
  },
  offer_manager: {
    label: 'Gestor de Ofertas',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
  },
  print_only: {
    label: 'Impressor ',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
  }
}

export function Users() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedFilter, setAppliedFilter] = useState('')
  const [loading, setLoading] = useState(false)

  // Estado para exclusão
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const formatDate = useCallback(dateString => {
    if (!dateString) return '---'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '---'
    return date.toLocaleDateString('pt-BR')
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data || [])
    } catch (error) {
      toastError('Erro ao buscar os usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleDeleteUser() {
    if (!userToDelete) return

    try {
      setDeleting(true)
      await api.delete(`/users/${userToDelete.id}`)
      toastSuccess(`Usuário "${userToDelete.name}" excluído com sucesso!`)
      setUserToDelete(null)
      await fetchUsers()
    } catch (error) {
      toastError(error.response?.data?.message || 'Erro ao excluir o usuário.')
    } finally {
      setDeleting(false)
    }
  }

  const userColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
        enableSorting: true
      },
      {
        accessorKey: 'username',
        header: 'Usuário',
        enableSorting: true
      },
      {
        accessorKey: 'role',
        header: 'Perfil',
        enableSorting: true,
        cell: ({ getValue }) => {
          const role = String(getValue() || '').toLowerCase()
          const roleInfo = ROLE_MAP[role] || {
            label: role || 'Não definido',
            className: 'bg-slate-100 text-slate-700'
          }

          return (
            <Badge
              variant="outline"
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-md shadow-none ${roleInfo.className}`}
            >
              {roleInfo.label}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'created_at',
        header: 'Data Cadastro',
        cell: ({ getValue }) => formatDate(getValue()),
        enableSorting: true
      },
      {
        accessorKey: 'updated_at',
        header: 'Última Alteração',
        cell: ({ getValue }) => formatDate(getValue()),
        enableSorting: true
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const isSelf = String(currentUser?.id) === String(row.original.id)

          return (
            <div className="flex items-center justify-end gap-1">
              {/* Botão Editar -> Profile */}
              <button
                type="button"
                title="Editar usuário"
                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                onClick={() =>
                  navigate(`/users/profile/${row.original.id}`, {
                    state: { user: row.original }
                  })
                }
              >
                <Pencil className="h-4 w-4" />
              </button>

              {/* Botão Excluir */}
              <button
                type="button"
                title={
                  isSelf
                    ? 'Você não pode excluir seu próprio usuário'
                    : 'Excluir usuário'
                }
                disabled={isSelf}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setUserToDelete(row.original)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        }
      }
    ],
    [formatDate, navigate, currentUser]
  )

  function handleApplyFilter() {
    setAppliedFilter(searchTerm.trim())
  }

  function handleClearFilter() {
    setSearchTerm('')
    setAppliedFilter('')
  }

  const filteredUsers = useMemo(() => {
    if (!appliedFilter) return users
    const term = appliedFilter.toLowerCase()
    return users.filter(
      user =>
        user.name?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term)
    )
  }, [users, appliedFilter])

  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold tracking-tight text-green-600">
                Gestão de Usuários
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Administre permissões, níveis de acesso e operadores do sistema.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate('/users/new')}
            label="Novo Usuário"
            icon={UserPlus}
            color="orange"
          />
        </div>

        {/* Painel de Filtros */}
        <Card className="border border-slate-200 shadow-none">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full">
              <div className="flex-1 space-y-1.5">
                <Label
                  htmlFor="user-search"
                  className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                >
                  Filtrar por nome ou usuário
                </Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="user-search"
                    placeholder="Ex: João Silva ou operador01..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyFilter()}
                    className="h-10 pl-10 rounded-xl border-slate-200 shadow-none focus-visible:ring-emerald-600 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  label="Filtrar"
                  color="green"
                  onClick={handleApplyFilter}
                  icon={Filter}
                />

                {(appliedFilter || searchTerm) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearFilter}
                    className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>Limpar</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <section className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden p-2 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 sm:p-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">
                Carregando lista de usuários...
              </p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable
                data={filteredUsers}
                columns={userColumns}
                showSelectColumn={false}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[320px] w-full p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <UsersIcon
                className="w-8 h-8 text-slate-300 mb-3"
                strokeWidth={1.5}
              />
              <h3 className="text-base font-semibold text-slate-800">
                Nenhum usuário encontrado
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                {appliedFilter
                  ? `Não localizamos registros com o termo "${appliedFilter}".`
                  : 'Nenhum usuário cadastrado no sistema até o momento.'}
              </p>
            </div>
          )}
        </section>

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
          title="Excluir Usuário"
          content={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}" (@${userToDelete?.username})? Esta ação não pode ser desfeita.`}
          icon={Trash2}
          variant="destructive"
          confirmButtonText="Sim, Excluir"
          isLoading={deleting}
        />
      </main>
    </Layout>
  )
}
