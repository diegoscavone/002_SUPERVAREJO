import { Container, Brand, Logout, RightItems } from './styles'

import Logo from '../../assets/icone_princesa.svg'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'
import { Notification } from '../Notification'

import { PiPower } from 'react-icons/pi'
import { Button } from '../ui/button'
import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { Power } from 'lucide-react'

export function Header() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    navigate('/')
    signOut()
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 mr-2" />
      </div>

      <div className="flex items-center gap-4">
        <Notification />
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Power className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
