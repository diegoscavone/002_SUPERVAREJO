import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import { toastError, toastInfo, toastSuccess } from '../styles/toastConfig'

const AuthContext = createContext({})

function AuthProvider({ children }) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  async function signIn({ username, password }) {
    try {
      const response = await api.post('/sessions', { username, password })
      const { user } = response.data

      // Salva apenas dados do perfil para exibição de UI, NUNCA o token
      localStorage.setItem('@posters:user', JSON.stringify(user))

      setData({ user })
    } catch (error) {
      if (error.response) {
        toastError(error.response.data.message || 'Verifique os dados informados.')
      } else {
        toastError('Erro ao acessar o servidor.')
      }
    }
  }

  async function signOut() {
    try {
      // Limpa o cookie HttpOnly no servidor
      await api.delete('/sessions')
    } catch (error) {
      console.error('Falha ao deslogar no servidor:', error)
    } finally {
      // Limpa dados locais da interface
      localStorage.removeItem('@posters:user')
      setData({})
    }
  }

  async function updateProfile({ user, avatarFile }) {
    try {
      if (avatarFile) {
        const fileUploadForm = new FormData()
        fileUploadForm.append('avatar', avatarFile)

        const response = await api.patch('/users/avatar', fileUploadForm)
        user.avatar = response.data.avatar
      }

      const response = await api.put('/users', user)
      const { requireLogout } = response.data

      if (requireLogout) {
        toastInfo('Senha alterada. Faça login novamente.')
        setTimeout(() => {
          signOut()
        }, 2000)
        return
      }

      localStorage.setItem('@posters:user', JSON.stringify(user))
      setData({ user })
      toastSuccess('Perfil atualizado com sucesso!')
    } catch (error) {
      if (error.response) {
        toastError(error.response.data.message || 'Não foi possível atualizar o perfil.')
      } else {
        toastError('Erro de conexão ao atualizar perfil.')
      }
    }
  }

  useEffect(() => {
    const user = localStorage.getItem('@posters:user')

    if (user) {
      try {
        setData({ user: JSON.parse(user) })
      } catch {
        localStorage.removeItem('@posters:user')
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        updateProfile,
        user: data.user,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  return context
}

export { AuthProvider, useAuth }