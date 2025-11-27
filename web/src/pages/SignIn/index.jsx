import { useState } from 'react'
import { useAuth } from '../../hooks/auth'

import { Container, Form, Label } from './styles'

import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

import brand from '../../assets/logo_princesa.svg'

import { PiUser, PiLockKey } from 'react-icons/pi'
import { toast, ToastContainer } from 'react-toastify'
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
      <Form>
        <img
          src={brand}
          alt="Logo Supermercados Princesa com as cores verde, vermelho e preto"
        />
        <div className="input-wrapper">
          <Label>Usuário</Label>
          <Input
            type="text"
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKeyEnter}
            icon={PiUser}
          />
        </div>
        <div className="input-wrapper">
          <Label>Senha</Label>
          <Input
            type="password"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyEnter}
            icon={PiLockKey}
          />
        </div>
        <div className="button-wrapper">
          <Button title="Entrar" color="GREEN" onClick={handleSignIn} />
        </div>
      </Form>
    </Container>
  )
}
