import { createContext, useContext, useState, useEffect } from 'react'

import { api } from '../services/api'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toastError, toastInfo, toastSuccess } from '../styles/toastConfig'

const AuthContext = createContext({})

function AuthProvider({ children }) {
  const [data, setData] = useState({})

  async function signIn({ username, password }) {
    try {
      const response = await api.post(
        'sessions',
        { username, password },
        { withCredentials: true }
      )
      const { user } = response.data

      localStorage.setItem('@posters:user', JSON.stringify(user))

      setData({ user })
    } catch (error) {
      if (error.reponse) {
        toastError('Verifique os dados informados')
      } else {
        toastError('Erro ao acessar o sistema.')
      }
    }
  }

  async function signOut() {
    localStorage.removeItem('@posters:user')
    setData({})
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

      if(requireLogout){
        toastInfo('Senha alterada, faça login novamente.')
        setTimeout(() => {
          signOut()
        }, 2000)
        return
      }
      localStorage.setItem('@posters:user', JSON.stringify(user))

      setData({ user })
      toastSuccess('Perfil atualizado com sucesso')
    } catch (error) {
      if (error.response) {
        toastError(error.response.message)
      } else {
        toastError('Não foi possível atualizar o perfil!')
      }
    }
  }

  useEffect(() => {
    const user = localStorage.getItem('@posters:user')

    if (user) {
      setData({
        user: JSON.parse(user)
      })
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        updateProfile,
        user: data.user
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
