import {
  Container,
  Content,
  Form,
  InputWrapper,
  ButtonWrapper,
  InputGroupWrapper,
  Avatar
} from './styles'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Input } from '../../components/Input'
import { Section } from '../../components/Section'

import { Nav } from '../../components/Nav'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from '../../components/Button'
import { Label } from '../Home/styles'
import { Select } from '../../components/Select'
import { useState } from 'react'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import { api } from '../../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { PiCamera } from 'react-icons/pi'
import { useAuth } from '../../hooks/auth'

import avatarPlaceholder from '../../assets/avatar_placeholder.svg'

export function Profile() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [oldPassword, setOldPassword] = useState()
  const [newPassword, setNewPassword] = useState()
  const [role, setRole] = useState(user.role)
  const [unit, setUnit] = useState(user.unit)

  const { id } = useParams()

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/tmp/uploads/${user.avatar}`
    : avatarPlaceholder

  const [avatar, setAvatar] = useState(avatarUrl)
  const [avatarFile, setAvatarFile] = useState(null)

  const navigate = useNavigate()

  const unitOptions = Array.from({ length: 10 }, (_, i) =>
    String(i + 1).padStart(3, '0')
  )

  function handleChangeAvatar(event) {
    const file = event.target.files[0]
    setAvatarFile(file)

    const imagePreview = URL.createObjectURL(file)
    setAvatar(imagePreview)
  }
  async function handleUpdateUser() {
    if (!name || !username || !role) {
      toastInfo('Preencha todos os campos.')
      return
    }
    try {
      const userData = {
        name,
        username,
        role,
        password: newPassword,
        old_password: oldPassword,
        unit
      }
      const userUpdated = Object.assign(user, userData)
      await updateProfile({ user: userUpdated, avatarFile })
      toastSuccess('Usuário alterado com sucesso!')
      setTimeout(() => {
        navigate('/users') // Redireciona após a atualização
      }, 2000)
    } catch (error) {
      toastError('Erro ao alterar usuário.')
    }
  }

  // async function handleUpdate() {
  //   if (!name || !username || !role || !unit) {
  //     toastInfo('Preencha todos os campos.')
  //     return
  //   }
  //   try {
  //     const userData = {
  //       name,
  //       username,
  //       role,
  //       unit,
  //       ...(newPassword && { password: newPassword })
  //     }
  //     await api.put(`/users/${id}`, userData)
  //     toastSuccess('Usuário alterado com sucesso!')
  //     setTimeout(() => {
  //       navigate('/users') // Redireciona após a atualização
  //     }, 2000)
  //   } catch (error) {
  //     toastError('Erro ao alterar usuário.')
  //   }
  // }

  async function handleDeleteUser() {
    if (!window.confirm('Deseja excluir este usuário?')) {
      return
    }
    try {
      await api.delete(`/users/${id}`)
      toastSuccess('Usuário excluído com sucesso!')
      setTimeout(() => {
        navigate('/users')
      }, 2000)
    } catch (error) {
      toastError('Erro ao excluir usuário.')
    }
  }
  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Form>
          <Section>
            <Avatar>
              <img src={avatar} alt="Foto do Usuário" />
              <label htmlFor="avatar">
                <PiCamera />
                <input id="avatar" type="file" onChange={handleChangeAvatar} />
              </label>
            </Avatar>
            <InputWrapper>
              <Label>Nome Completo</Label>
              <Input
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Usuário</Label>
              <Input
                name="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </InputWrapper>
            <InputGroupWrapper>
              <Label>Senha Antiga</Label>
              <Input
                name="old_password"
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
            </InputGroupWrapper>
            <InputGroupWrapper>
              <Label>Nova Senha</Label>
              <Input
                name="password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </InputGroupWrapper>

            <InputGroupWrapper>
              <Label>Perfil de Acesso</Label>
              <Select value={role} onChange={e => setRole(e.target.value)}>
                <option value={0}>Selecione um Perfil</option>
                <option value="admin">Administrador</option>
                <option value="offer_manager">Gerente de Ofertas</option>
                <option value="print_only">Impressor</option>
              </Select>
            </InputGroupWrapper>

            <InputGroupWrapper>
              <Label>Unidade</Label>
              <Select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="">Selecione uma Unidade</option>
                {unitOptions.map(unitOption => (
                  <option key={unitOption} value={unitOption}>
                    {unitOption}
                  </option>
                ))}
              </Select>
            </InputGroupWrapper>
          </Section>

          <Section>
            <ButtonWrapper>
              <Button title="Salvar" color="GREEN" onClick={handleUpdateUser} />
              <Button title="Excluir" color="RED" onClick={handleDeleteUser} />
            </ButtonWrapper>
          </Section>
        </Form>
      </Content>

      <Footer />
    </Container>
  )
}
