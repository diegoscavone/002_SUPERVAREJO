import { useState } from 'react'
import { useAuth } from '../../hooks/auth'

import { Container } from './styles'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'

import brand from '../../assets/logo_princesa.svg'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Lock, UserRound } from 'lucide-react'
import { PiLockKey, PiUser } from 'react-icons/pi'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toastInfo } from '../../styles/toastConfig'

export function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { signIn } = useAuth()

  function handleSignIn() {
    if (username.length === 0 || password.length === 0) {
      toastInfo('Preencha todos os campos.')
      return
    }
    signIn({ username, password })
  }

  function handleKeyEnter(event) {
    if (event.key === 'Enter') {
      handleSignIn()
    }
  }

  return (
    <Container>
      <ToastContainer />
      <Field className="w-96 bg-white rounded-3xl p-8 flex flex-col items-center">
        <img
          src={brand}
          alt="Logo Supermercados Princesa com as cores verde, vermelho e preto"
          className="max-h-24 w-auto"
        />
        <Field className="flex gap-1">
          <FieldLabel htmlFor="username">Usuário</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="username"
              type="text"
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyEnter}
            />
            <InputGroupAddon align="inline-start">
              <UserRound className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field className="flex gap-1">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="password"
              type="password"
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyEnter}
            />
            <InputGroupAddon align="inline-start">
              <Lock className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <Field>
          <Button
            type="submit"
            onClick={handleSignIn}
            className="bg-green-600 hover:bg-green-700 text-white w-full"
          >
            Entrar
          </Button>
        </Field>
      </Field>
    </Container>
  )
}
