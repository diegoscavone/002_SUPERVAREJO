import {
  Container,
  Content,
  Table,
  TableWrapper,
  ButtonWrapper,
  Message,
  GroupDate,
  InputWrapper,
  Label,
  Form,
  ButtonSearch
} from './styles'

import { PiFunnel, PiMagnifyingGlass, PiUserCirclePlus } from 'react-icons/pi'

import { Header } from '../../components/Header'
import { Nav } from '../../components/Nav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import { api } from '../../services/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/Input'
import { toastError } from '../../styles/toastConfig'
import { PostersTable } from '../../components/PostersTable'

export function Users() {
  const [users, setUsers] = useState([])
  const [nameFilter, setNameFilter] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const userColumns = [
    { accessorKey: 'name', header: 'Nome', enableSorting: true },
    { accessorKey: 'username', header: 'Usuário', enableSorting: true },
    { accessorKey: 'role', header: 'Perfil', enableSorting: true },
    {
      accessorKey: 'created_at',
      header: 'Data Cadastro',
      cell: ({ getValue }) => formatDate(getValue()),
      enableSorting: true
    },
    {
      accessorKey: 'updated_at',
      header: 'Data Alterção',
      cell: ({ getValue }) => formatDate(getValue()),
      enableSorting: true
    }
  ]

  function applyFilters() {
    let filtered = users
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(nameFilter.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get('/users')
        setUsers(response.data)
        setFilteredUsers(response.data)
      } catch (error) {
        toastError('Erro ao buscar os usuários.')
      }
    }
    fetchUsers()
  }, [])

  function formatDate(date) {
    const dateFormat = new Date(date)
    const dia = String(dateFormat.getDate()).padStart(2, '0')
    const mes = String(dateFormat.getMonth() + 1).padStart(2, '0')
    const ano = dateFormat.getFullYear()
    return `${dia}/${mes}/${ano}`
  }
  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <div className="content-header">
          <Button
            title="Novo Usuário"
            icon={PiUserCirclePlus}
            color="ORANGE"
            onClick={() => navigate('/users/new')}
          />
        </div>
        <Section title="Gestão de Usuários">
          <Form>
            <InputWrapper>
              <Label>Nome</Label>
              <Input
                id="nameFilter"
                placeholder="Digite o nome do usuário"
                type="text"
                value={nameFilter}
                onChange={e => setNameFilter(e.target.value)}
              />
            </InputWrapper>
            <ButtonSearch>
              <Button
                title="Filtrar"
                icon={PiFunnel}
                color="GREEN"
                onClick={applyFilters}
              />
            </ButtonSearch>
          </Form>
        </Section>
        <Section>
          {filteredUsers.length > 0 ? (
            <PostersTable
              data={filteredUsers.map(user => ({
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at
              }))}
              columns={userColumns}
              showEditColumn={true}
              showSelectColumn={false}
              editType="users"
            />
          ) : (
            <Message>
              <p>Nenhum usuário encontrado.</p>
            </Message>
          )}
        </Section>
      </Content>

      <Footer />
    </Container>
  )
}
