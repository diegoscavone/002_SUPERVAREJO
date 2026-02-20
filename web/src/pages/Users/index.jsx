import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { PiFunnel, PiUserCirclePlus } from 'react-icons/pi'
import { UserRound, Search, Users as UsersIcon } from 'lucide-react'

import { api } from '../../services/api'
import { toastError } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout'
import { Section } from '../../components/Section'
import { DataTable } from '../../components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Container, Content } from './styles'

export function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [nameFilter, setNameFilter] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const userColumns = [
    { accessorKey: 'name', header: 'Nome', enableSorting: true },
    { accessorKey: 'username', header: 'Usuário', enableSorting: true },
    {
      accessorKey: 'role',
      header: 'Perfil',
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="capitalize px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
          {getValue()}
        </span>
      )
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
    }
  ]

  async function fetchUsers() {
    try {
      setLoading(true)
      const response = await api.get('/users')
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      toastError('Erro ao buscar os usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  function applyFilters() {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(nameFilter.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  function formatDate(date) {
    if (!date) return '---'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content className="flex flex-col gap-6 p-6">
          {/* HEADER DA PÁGINA */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-lg font-bold text-neutral-500 flex items-center gap-2">
                <UsersIcon size={20} className="text-green-600" />
                Gestão de Usuários
              </h1>
              <p className="text-xs text-neutral-500">
                Administre as permissões e acessos do sistema.
              </p>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-none gap-2"
              onClick={() => navigate('/users/new')}
            >
              <UserRound size={18} /> Novo Usuário
            </Button>
          </div>

          {/* SEÇÃO DE FILTROS */}
          <Section>
            <div className="flex items-end gap-4 bg-white  rounded-xl ">
              <div className="flex-1 max-w-sm space-y-2">
                <Label
                  htmlFor="nameFilter"
                  className="text-neutral-500 font-normal"
                >
                  Filtrar por nome
                </Label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <Input
                    id="nameFilter"
                    placeholder="Ex: João Silva"
                    className="pl-10 focus-visible:ring-orange-500"
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              <Button
                onClick={applyFilters}
                className="bg-green-600 hover:bg-green-700 text-white gap-2 h-10 px-6"
              >
                <PiFunnel size={18} />
                Filtrar
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setNameFilter('')
                  setFilteredUsers(users)
                }}
                className="h-10 text-slate-500"
              >
                Limpar
              </Button>
            </div>
          </Section>

          {/* TABELA DE RESULTADOS */}
          <Section>
            {filteredUsers.length > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden">
                <DataTable
                  data={filteredUsers}
                  columns={userColumns}
                  showEditColumn={true}
                  showSelectColumn={false}
                  onRowUpdate={id => navigate(`/users/edit/${id}`)}
                />
              </div>
            ) : (
              /* EMPTY STATE PADRONIZADO */
              <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in duration-500">
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
                  <UsersIcon
                    className="w-10 h-10 text-slate-200"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-[280px]">
                  Não encontramos nenhum registro com o nome{' '}
                  <strong>"{nameFilter}"</strong>. Verifique a grafia ou limpe o
                  filtro.
                </p>
                <Button
                  variant="link"
                  className="mt-4 text-orange-500"
                  onClick={() => {
                    setNameFilter('')
                    setFilteredUsers(users)
                  }}
                >
                  Mostrar todos os usuários
                </Button>
              </div>
            )}
          </Section>
        </Content>
      </Container>
    </Layout>
  )
}
