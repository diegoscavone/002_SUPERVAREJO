import { Check, KeyRound, Loader2, Lock, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../hooks/auth'
import { api, apiERP } from '../../services/api'
import { toastError, toastSuccess } from '../../styles/toastConfig'

import { Button } from '@/components/Button'
import { InputCustom } from '@/components/InputCustom'
import { Layout } from '@/components/Layout'
import { SelectCustom } from '@/components/SelectCustom'
import {
  Card,
  CardContent
} from '@/components/ui/card'

export function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: loggedUser, signOut } = useAuth()

  // Define se o modo atual é um Admin editando um terceiro ou o usuário em seu próprio perfil
  const isEditingOtherUser = Boolean(id) && loggedUser?.role === 'admin'

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('operator')
  const [unit, setUnit] = useState('none')

  // Senhas
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Se for admin editando outro usuário, busca por ID; senão, carrega o usuário logado
        const targetUserId = id || loggedUser?.id

        const [userRes, unitsRes] = await Promise.all([
          api.get(`/users/${targetUserId}`),
          apiERP.get('/units').catch(() => ({ data: [] }))
        ])

        const userData = userRes.data
        setName(userData.name || '')
        setUsername(userData.username || '')
        setRole(userData.role || 'operator')
        setUnit(userData.unit ? String(Number(userData.unit)) : 'none')

        setUnits(unitsRes.data || [])
      } catch (error) {
        toastError('Erro ao carregar dados do usuário.')
        navigate(-1)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, loggedUser?.id, navigate])

  async function handleSaveUser(e) {
    e.preventDefault()

    if (!name.trim() || !username.trim()) {
      return toastError('Nome e usuário são obrigatórios.')
    }

    try {
      setSaving(true)

      if (isEditingOtherUser) {
        // FLUXO ADMIN: Altera qualquer campo e senha sem exigir old_password
        const payload = {
          name: name.trim(),
          username: username.trim(),
          role,
          unit: unit !== 'none' ? String(unit) : null
        }

        if (newPassword.trim()) {
          payload.password = newPassword.trim()
        }

        await api.put(`/users/${id}`, payload)
        toastSuccess('Usuário atualizado com sucesso!')
        setTimeout(() => navigate('/users'), 1200)
      } else {
        // FLUXO PERFIL PRÓPRIO: Altera apenas dados cadastrais e senha com old_password
        const payload = {
          name: name.trim(),
          username: username.trim()
        }

        if (newPassword.trim()) {
          if (!oldPassword.trim()) {
            return toastError(
              'Informe sua senha atual para definir a nova senha.'
            )
          }
          payload.password = newPassword.trim()
          payload.old_password = oldPassword.trim()
        }

        const response = await api.put('/users', payload)

        if (response.data?.requireLogout) {
          toastSuccess('Senha alterada! Faça login novamente.')
          setTimeout(() => signOut(), 1500)
          return
        }

        toastSuccess('Perfil atualizado com sucesso!')
      }
    } catch (error) {
      toastError(error.response?.data?.message || 'Erro ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Carregando dados...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {/* Header Superior */}
        <div className="flex flex-col justify-between gap-2 bg-card border border-border/60 p-4 sm:p-6 rounded-2xl shadow-xs">
          <h1 className="text-xl font-bold tracking-tight text-green-600 flex items-center gap-2">
            <User className="h-6 w-6 text-green-600" />
            {isEditingOtherUser ? 'Editar Usuário' : 'Meu Perfil'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isEditingOtherUser
              ? 'Gerencie os dados cadastrais, cargo e senha do operador.'
              : 'Mantenha suas informações pessoais e credenciais de acesso atualizadas.'}
          </p>
        </div>

        {/* Card Formulário */}
        <Card className="border border-slate-200 shadow-none">
          <CardContent className="pt-6">
            <form onSubmit={handleSaveUser} className="space-y-5">
              {/* Grid 1: Nome e Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputCustom
                  label="Nome Completo"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  required
                />

                <InputCustom
                  label="Usuário (Login)"
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ex: joao.silva"
                  required
                />
              </div>

              {/* Grid 2: Perfil e Loja (Exibido para Admin editando outros usuários) */}
              {isEditingOtherUser && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <SelectCustom
                    label="Perfil de Acesso"
                    id="role"
                    value={role}
                    onValueChange={setRole}
                    options={[
                      { value: 'operator', label: 'Operador' },
                      { value: 'offer_manager', label: 'Gestor de Ofertas' },
                      { value: 'print_only', label: 'Apenas Impressão' },
                      { value: 'admin', label: 'Administrador' }
                    ]}
                  />

                  <SelectCustom
                    label="Loja Vinculada"
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
                </div>
              )}

              {/* Seção de Senha */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-emerald-600" />
                    Alteração de Senha
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isEditingOtherUser
                      ? 'Como administrador, você pode redefinir a senha do usuário sem digitar a senha antiga.'
                      : 'Para trocar sua senha, é obrigatório confirmar a senha atual.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Se for o próprio perfil, exibe o campo Senha Atual */}
                  {!isEditingOtherUser && (
                    <InputCustom
                      label="Senha Atual"
                      id="old_password"
                      type="password"
                      icon={Lock}
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      placeholder="Sua senha atual..."
                    />
                  )}

                  <InputCustom
                    label={
                      isEditingOtherUser
                        ? 'Nova Senha (Opcional)'
                        : 'Nova Senha'
                    }
                    id="new_password"
                    type="password"
                    icon={KeyRound}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres..."
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  color="cancel"
                  label="Cancelar"
                  onClick={() => navigate(-1)}
                />

                <Button
                  type="submit"
                  color="green"
                  icon={Check}
                  label="Salvar Alterações"
                  isLoading={saving}
                />
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  )
}
