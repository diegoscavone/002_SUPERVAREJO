import { BrowserRouter } from 'react-router-dom'

import { useAuth } from '../hooks/auth'

import { AdminRoutes } from './admin.routes'
import { AuthRoutes } from './auth.routes'
import { OfferManagerRoutes } from './offer_manager.routes'
import { PrintOnlyRoutes } from './print_only.routes'
import { useEffect } from 'react'
import { api } from '../services/api'

export function Routes() {
  const { user, signOut } = useAuth()

  useEffect(() =>{
    api.get('/users/validated').catch(error => {
      if(error.response?.status === 401){
        signOut()
      }
    })
  }, [])

  function AcessRoute() {
    if(user.role === 'admin') {
      return <AdminRoutes />
    } else if(user.role === 'offer_manager') {
      return <OfferManagerRoutes />
    } else if(user.role === 'print_only') {
      return <PrintOnlyRoutes />
    } else {
      return <AuthRoutes />
    }
  }

  return(
    <BrowserRouter>
      { user ? <AcessRoute /> : <AuthRoutes />}
    </BrowserRouter>
  )
}
