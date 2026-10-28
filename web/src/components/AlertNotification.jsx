import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const AlertNotificationContext = createContext({})

const variantStyles = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/20 sm:border-zinc-200/80 dark:sm:border-zinc-800',
    title: 'Sucesso',
  },
  destructive: {
    icon: AlertCircle,
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-500/20 sm:border-zinc-200/80 dark:sm:border-zinc-800',
    title: 'Erro',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/20 sm:border-zinc-200/80 dark:sm:border-zinc-800',
    title: 'Atenção',
  },
  info: {
    icon: Info,
    iconColor: 'text-zinc-700 dark:text-zinc-300',
    borderColor: 'border-zinc-500/20 sm:border-zinc-200/80 dark:sm:border-zinc-800',
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
        // Mobile-first: Compacto, barra inferior centralizada ou ajustada, altura reduzida
        'group pointer-events-auto relative flex w-full items-center sm:items-start gap-2.5 sm:gap-3',
        'rounded-xl sm:rounded-lg border bg-background/95 px-3 py-2 sm:p-4 shadow-md sm:shadow-lg backdrop-blur-md transition-all duration-200',
        'dark:bg-zinc-950/95',
        config.borderColor,
        'animate-in fade-in-0 slide-in-from-bottom-3 sm:slide-in-from-top-2'
      )}
    >
      <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5 shrink-0 sm:mt-0.5', config.iconColor)} />

      {/* Conteúdo textual responsivo: inline no mobile, estruturado no desktop */}
      <div className="flex-1 min-w-0 pr-1 sm:pr-4">
        {/* Desktop Title */}
        <h5 className="hidden sm:block text-sm font-medium tracking-tight text-foreground">
          {item.title || config.title}
        </h5>

        {/* Mensagem direta: truncada em 1 linha no mobile se for muito longa */}
        <p className="text-xs text-foreground/90 sm:text-muted-foreground sm:mt-0.5 leading-snug font-medium sm:font-normal truncate sm:whitespace-normal">
          {item.message || item.title || config.title}
        </p>
      </div>

      {/* Botão fechar */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus:outline-none"
        aria-label="Fechar notificação"
      >
        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>

      {/* Linha discreta de progresso */}
      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-xl sm:rounded-b-lg bg-transparent">
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

      {/* Container posicionado no rodapé no mobile (bottom-4) e no topo à direita no desktop (sm:top-4 sm:right-4 sm:bottom-auto) */}
      <aside
        aria-label="Notificações do sistema"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm sm:max-w-[360px] mx-auto sm:mx-0"
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
  success: (message, title = 'Sucesso', duration = 2000) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'success', duration }),
  error: (message, title = 'Erro', duration = 3500) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'destructive', duration }),
  warning: (message, title = 'Atenção', duration = 2500) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'warning', duration }),
  info: (message, title = 'Informação', duration = 2000) =>
    notifyTrigger && notifyTrigger({ message, title, variant: 'info', duration }),
}