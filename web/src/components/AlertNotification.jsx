import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const AlertNotificationContext = createContext({})

const variantStyles = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-500',
    borderColor: 'border-zinc-200/80 dark:border-zinc-800',
    title: 'Sucesso',
  },
  destructive: {
    icon: AlertCircle,
    iconColor: 'text-rose-600 dark:text-rose-500',
    borderColor: 'border-zinc-200/80 dark:border-zinc-800',
    title: 'Erro',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-500',
    borderColor: 'border-zinc-200/80 dark:border-zinc-800',
    title: 'Atenção',
  },
  info: {
    icon: Info,
    iconColor: 'text-zinc-700 dark:text-zinc-300',
    borderColor: 'border-zinc-200/80 dark:border-zinc-800',
    title: 'Aviso',
  },
}

let notifyTrigger = null

function AlertItem({ item, onRemove }) {
  const [isPaused, setIsPaused] = useState(false)
  const remainingTimeRef = useRef(item.duration)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef(null)

  const config = variantStyles[item.variant] || variantStyles.info
  const Icon = config.icon

  const startTimer = useCallback(() => {
    if (item.duration <= 0) return
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      onRemove(item.id)
    }, remainingTimeRef.current)
  }, [item.duration, item.id, onRemove])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
      remainingTimeRef.current -= Date.now() - startTimeRef.current
    }
  }, [])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  return (
    <div
      role="alert"
      onMouseEnter={() => {
        setIsPaused(true)
        pauseTimer()
      }}
      onMouseLeave={() => {
        setIsPaused(false)
        startTimer()
      }}
      className={cn(
        'group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur-md transition-all duration-200',
        'dark:bg-zinc-950/95',
        config.borderColor,
        'animate-in fade-in-0 slide-in-from-top-2 sm:slide-in-from-bottom-2'
      )}
    >
      {/* Ícone sutil e sem caixa pesada */}
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} />

      {/* Conteúdo textual direto */}
      <div className="flex-1 pr-4">
        <h5 className="text-sm font-medium tracking-tight text-foreground">
          {item.title || config.title}
        </h5>
        {item.message && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed font-normal">
            {item.message}
          </p>
        )}
      </div>

      {/* Botão fechar minimalista (visível sutilmente ao hover) */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
        aria-label="Fechar notificação"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Linha discreta de progresso no rodapé */}
      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-lg bg-transparent">
          <div
            className="h-full bg-foreground/15 dark:bg-foreground/20 transition-all"
            style={{
              animation: `shrinkProgress ${item.duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}
    </div>
  )
}

export function AlertNotificationProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }, [])

  const addAlert = useCallback(
    ({ title, message, variant = 'info', duration = 3500 }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
      const normalizedVariant = variant === 'error' ? 'destructive' : variant

      setAlerts((prev) => [...prev, { id, title, message, variant: normalizedVariant, duration }])
      return id
    },
    []
  )

  notifyTrigger = addAlert

  return (
    <AlertNotificationContext.Provider value={{ addAlert, removeAlert }}>
      {children}

      {/* Posição no canto inferior direito ou superior direito limpo */}
      <aside
        aria-label="Notificações do sistema"
        className="fixed top-4 right-4 z-[9999] flex w-full max-w-[360px] flex-col gap-2 pointer-events-none p-3 sm:p-0"
      >
        {alerts.map((item) => (
          <AlertItem key={item.id} item={item} onRemove={removeAlert} />
        ))}
      </aside>
    </AlertNotificationContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertNotificationContext)
  if (!context) {
    throw new Error('useAlert deve ser utilizado dentro de AlertNotificationProvider')
  }
  return context
}

export const alertNotify = {
  success: (message, title = 'Sucesso', duration = 3000) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'success', duration }),
  error: (message, title = 'Erro', duration = 4500) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'destructive', duration }),
  warning: (message, title = 'Atenção', duration = 3500) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'warning', duration }),
  info: (message, title = 'Informação', duration = 3000) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'info', duration }),
}