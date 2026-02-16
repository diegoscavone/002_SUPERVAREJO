import { Container, Brand, Logout, RightItems } from './styles'

import Logo from '../../assets/icone_princesa.svg'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'
import { Notification } from '../Notification'

import { PiPower  } from 'react-icons/pi'
import { Button } from '../ui/button'

export function Header() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    navigate('/')
    signOut()
  }

  return (
    <Container>
      <Brand>
        <Link to="/">
          <img src={Logo} alt="Logo Supermercados Princesa Verde e Vemelho" />
        </Link>
      </Brand>
      <RightItems>
        <Notification />
        <Logout>
          <button onClick={handleSignOut}>
            <PiPower/>
            {/* Sair */}
          </button>
        </Logout>
      </RightItems>
    </Container>
  )
}
