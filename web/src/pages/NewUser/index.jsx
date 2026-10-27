import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  Check,
  KeyRound,
  Loader2,
  UserPlus
} from 'lucide-react'

import { api, apiERP } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import avatarPlaceholder from '../../assets/avatar_placeholder.svg'

import { Layout } from '@/components/Layout'
import { Button } from '@/components/Button'
import { InputCustom } from '@/components/InputCustom'
import { SelectCustom } from '@/components/SelectCustom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function NewUser() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [unit, setUnit] = useState('none')

  const [avatar, setAvatar] = useState(avatarPlaceholder)
  const [avatarFile, setAvatarFile] = useState(null)

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(false)

  // Carrega lista de lojas reais do ERP (com fallback para unidades fixas de 001 a 010 se o ERP falhar)
  useEffect(() => {
    async function loadUnits() {
      try {
        const response = await apiERP.get('/units')
        if (response.data && response.data.length > 0) {
          setUnits(response.data)
        } else {
          // Fallback de 001 a 010
          setUnits(
            Array.from({ length: 10 }, (_, i) => ({
              unid_codigo: String(i + 1).padStart(3, '0'),
              unid_reduzido: `Loja ${String(i + 1).padStart(3, '0')}`
            }))
          )
        }
      } catch {
        setUnits(
          Array.from({ length: 10 }, (_, i) => ({
            unid_codigo: String(i + 1).padStart(3, '0'),
            unid_reduzido: `Loja ${String(i + 1).padStart(3, '0')}`
          }))
        )
      }
    }

    loadUnits()
  }, [])

  // Limpeza de memory leak do URL temporário do avatar
  useEffect(() => {
    return () => {
      if (avatar && avatar.startsWith('blob:')) {
        URL.revokeObjectURL(avatar)
      }
    }
  }, [avatar])

  function handleChangeAvatar(event) {
    const file = event.target.files?.[0]
    if (file) {
      if (avatar && avatar.startsWith('blob:')) {
        URL.revokeObjectURL(avatar)
      }
      setAvatarFile(file)
      setAvatar(URL.createObjectURL(file))
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()

    if (!name.trim() || !username.trim() || !password.trim() || !role) {
      return toastInfo('Preencha todos os campos obrigatórios.')
    }

    if (password.length < 6) {
      return toastInfo('A senha deve ter no mínimo 6 caracteres.')
    }

    try {
      setLoading(true)

      const formattedUnit =
        unit && unit !== 'none' ? String(unit).padStart(3, '0') : null

      const response = await api.post('/users', {
        name: name.trim(),
        username: username.trim(),
        password,
        role,
        unit: formattedUnit
      })

      // Se houver arquivo de avatar selecionado, envia logo em seguida
      if (avatarFile && response?.data?.id) {
        const avatarFormData = new FormData()
        avatarFormData.append('avatar', avatarFile)
        await api
          .patch(`/users/avatar/${response.data.id}`, avatarFormData)
          .catch(() => null)
      }

      toastSuccess('Usuário criado com sucesso!')
      setTimeout(() => navigate('/users'), 1200)
    } catch (error) {
      toastError(
        error.response?.data?.message ||
          'Ocorreu um erro ao tentar cadastrar o usuário.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {/* Header Superior Responsivo */}
        <div className="flex flex-col justify-between gap-2 bg-card border border-border/60 p-4 sm:p-6 rounded-2xl shadow-xs">
          <h1 className="text-xl font-bold tracking-tight text-green-600 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-green-600" />
            Novo Usuário
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cadastre um novo operador, gestor de ofertas ou administrador do
            sistema.
          </p>
        </div>

        {/* Card do Formulário */}
        <Card className="border border-slate-200 shadow-none">
          <CardContent className="pt-6">
            <form onSubmit={handleCreateUser} className="space-y-6">
              {/* Grid 1: Nome e Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputCustom
                  label="Nome Completo"
                  id="name"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />

                <InputCustom
                  label="Usuário (Login)"
                  id="username"
                  placeholder="Ex: joao.silva"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Grid 3: Unidade / Loja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectCustom
                  label="Loja / Unidade"
                  id="unit"
                  value={unit}
                  onValueChange={setUnit}
                  placeholder="Selecione a loja"
                  options={[
                    { value: 'none', label: 'Sem loja fixa' },
                    ...units.map(u => ({
                      value: String(Number(u.unid_codigo)),
                      label: u.unid_reduzido || `Loja ${u.unid_codigo}`
                    }))
                  ]}
                />

                <SelectCustom
                  label="Perfil de Acesso"
                  id="role"
                  value={role}
                  onValueChange={setRole}
                  placeholder="Selecione o perfil"
                  options={[
                    { value: 'offer_manager', label: 'Gestor de Ofertas' },
                    { value: 'print_only', label: 'Operador' },
                    { value: 'admin', label: 'Administrador' }
                  ]}
                />
              </div>

              {/* Grid 2: Senha e Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputCustom
                  label="Senha de Acesso"
                  id="password"
                  type="password"
                  icon={KeyRound}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Ações / Footer */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  color="cancel"
                  label="Cancelar"
                  onClick={() => navigate('/users')}
                />

                <Button
                  type="submit"
                  color="green"
                  icon={Check}
                  label="Salvar Usuário"
                  isLoading={loading}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  )
}
