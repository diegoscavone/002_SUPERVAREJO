import { useState } from 'react'
import { useAuth } from '../../hooks/auth'
import { InputCustom } from '../../components/InputCustom'
import { Button } from '../../components/Button'
import brand from '../../assets/logo_princesa.svg'
import backgroundImg from '../../assets/background.jpg'
import { Lock, UserRound } from 'lucide-react'
import { toastInfo } from '../../styles/toastConfig' // Já apontando para o Alert novo!

export function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()

  async function handleSignIn(event) {
    if (event) event.preventDefault()

    if (!username.trim() || !password.trim()) {
      toastInfo('Preencha todos os campos.')
      return
    }

    try {
      setIsLoading(true)
      await signIn({ username: username.trim(), password })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-zinc-950 bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/80 bg-white p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
        <header className="mb-8 flex flex-col items-center w-full">
          <img
            src={brand}
            alt="Logo Supermercados Princesa"
            className="h-28 sm:h-24 w-auto max-w-full object-contain"
          />
        </header>

        <form onSubmit={handleSignIn} className="flex w-full flex-col gap-4">
          <InputCustom
            id="username"
            label="Usuário"
            placeholder="Digite seu usuário"
            type="text"
            autoComplete="username"
            autoFocus
            icon={UserRound}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputCustom
            id="password"
            label="Senha"
            placeholder="Digite sua senha"
            type="password"
            autoComplete="current-password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium h-11 transition-all"
          >
            {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
          </Button>
        </form>
      </div>
    </div>
  )
}