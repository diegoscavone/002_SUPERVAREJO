import { AlertNotificationProvider } from '@/components/AlertNotification'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { AuthProvider } from './hooks/auth'
import { queryClient } from './hooks/queryClient'
import './index.css'
import { Routes } from './routes'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertNotificationProvider>
          <Routes />
        </AlertNotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
