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
import { useNavigate } from 'react-router-dom'

import avatarPlaceholder from '../../assets/avatar_placeholder.svg'
import { useAuth } from '../../hooks/auth'
import { PiCamera } from 'react-icons/pi'

export function NewUser() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [unit, setUnit] = useState('') // New state for unit

  const avatarUrl = avatarPlaceholder

  const [avatar, setAvatar] = useState(avatarUrl)
  const [avatarFile, setAvatarFile] = useState(null)

  const navigate = useNavigate()

  // Create an array of unit options from 001 to 010
  const unitOptions = Array.from({ length: 10 }, (_, i) =>
    String(i + 1).padStart(3, '0')
  )

  async function handleCreateUser() {
    if (!name || !username || !password || !role || !unit) {
      // Added unit validation
      toastInfo('Preencha todos os campos.')
      return
    }
    try {
      // Garantir que unit sempre seja formatado com 3 dígitos
      const formattedUnit = String(unit).padStart(3, '0')
      await api.post('/users', {
        name,
        username,
        password,
        role,
        unit: formattedUnit
      }) // Added unit to API request
      toastSuccess('Usuário criado com sucesso!')
      setTimeout(() => {
        navigate('/users')
      }, 2000)
    } catch (error) {
      toastError('Ocorreu um erro ao tentar cadastrar o usuário.')
    }
  }

  function handleChangeAvatar(event) {
    const file = event.target.files[0]
    setAvatarFile(file)

    const imagePreview = URL.createObjectURL(file)
    setAvatar(imagePreview)
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

            <InputGroupWrapper>
              <Label>Usuário</Label>
              <Input
                name="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </InputGroupWrapper>

            <InputGroupWrapper>
              <Label>Senha</Label>
              <Input
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

            {/* New Unit Selection */}
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
              <Button title="Salvar" color="GREEN" onClick={handleCreateUser} />
            </ButtonWrapper>
          </Section>
        </Form>
      </Content>

      <Footer />
    </Container>
  )
}
