import { useEffect, useState } from 'react'
import { Container, Divider, Profile } from './styles'

import {
  PiSealPercent,
  PiTag,
  PiIdentificationBadge,
  PiPrinter,
  PiFileImage,
  PiPlayCircle,
  PiUserCirclePlus,
  PiUsers,
  PiListBold,
  PiQrCode,
  PiCaretDoubleLeft,
  PiCaretDoubleRight
} from 'react-icons/pi'

import { CircleArrowLeft, CircleArrowRight } from 'lucide-react'

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'

import avatarPlaceHolder from '../../assets/avatar_placeholder.svg'
import { api } from '../../services/api'

export function Nav() {
  const [selectedMenu, setSelectedMenu] = useState('Criar Cartaz')
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isManualCollapsed, setIsManualCollapsed] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/tmp/uploads/${user.avatar}`
    : avatarPlaceHolder

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setSelectedMenu('Cartaz')
        break
      case '/print':
        setSelectedMenu('Imprimir')
        break
      case '/campaigns':
        setSelectedMenu('Campanhas')
        break
      case '/automate':
        setSelectedMenu('Automação')
        break
      case '/users/new':
        setSelectedMenu('Novo Usuário')
        break
      case '/users':
        setSelectedMenu('Usuários')
        break
      case '/offers':
        setSelectedMenu('Ofertas')
        break
      case '/offers/new':
        setSelectedMenu('Nova Oferta')
        break
      case '/productsValidity':
        setSelectedMenu('Validades')
        break
      default:
        setSelectedMenu('')
    }
  }, [location.pathname])

  function handleSelectMenu(menu) {
    setSelectedMenu(menu)
  }

  function handleProfile() {
    navigate(`/users/profile/${user.id}`)
  }

  function handleToggleCollapse() {
    setIsManualCollapsed(prevState => {
      const newState = !prevState
      setIsCollapsed(newState) // Set isCollapsed based on the manual state
      return newState
    })
  }

  return (
    <Container
      $isCollapsed={isCollapsed}
      onMouseEnter={() => !isManualCollapsed && setIsCollapsed(false)}
      onMouseLeave={() => !isManualCollapsed && setIsCollapsed(true)}
    >
      <Profile $isCollapsed={isCollapsed}>
        {/* {!isCollapsed && (
          <a onClick={handleProfile}>
            <img
              className="profile-img"
              src={avatarUrl}
              alt="Foto do Usuário"
            />
          </a>
        )}
        {!isCollapsed && <span className="profile-welcome">Bem vindo</span>}
        {!isCollapsed && <strong className="profile-name">{user.name}</strong>} */}
        <button
          className="collapse-button"
          onClick={handleToggleCollapse}
        >
          {isCollapsed ? (
            <CircleArrowRight size={18} />
          ) : (
            <CircleArrowLeft size={18} />
          )}
        </button>

      </Profile>
      <ul className={isCollapsed ? 'collapsed' : ''}>
        {user.role === 'admin' && (
          <>
            {/* <li
              className={selectedMenu === 'Nova Oferta' ? 'active' : ''}
              onClick={() => handleSelectMenu('Nova Oferta')}
            >
              <Link to="/offers/new">
                <PiSealPercent className='icon'/>
                {!isCollapsed && 'Nova Oferta'}
              </Link>
            </li> */}
            <li
              className={selectedMenu === 'Ofertas' ? 'active' : ''}
              onClick={() => handleSelectMenu('Ofertas')}
            >
              <Link to="/offers">
                <PiTag /> {!isCollapsed && 'Ofertas'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Validades' ? 'active' : ''}
              onClick={() => handleSelectMenu('Validades')}
            >
              <Link to="/productsValidity">
                <PiQrCode />
                {!isCollapsed && 'Validades'}
              </Link>
            </li>
            <Divider className="divider" />
            <li
              className={selectedMenu === 'Cartaz' ? 'active' : ''}
              onClick={() => handleSelectMenu('Cartaz')}
            >
              <Link to="/">
                <PiIdentificationBadge /> {!isCollapsed && 'Cartaz'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Imprimir' ? 'active' : ''}
              onClick={() => handleSelectMenu('Imprimir')}
            >
              <Link to="/print">
                <PiPrinter />
                {!isCollapsed && 'Imprimir'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Campanhas' ? 'active' : ''}
              onClick={() => handleSelectMenu('Campanhas')}
            >
              <Link to="/campaigns">
                <PiFileImage />
                {!isCollapsed && 'Campanhas'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Automação' ? 'active' : ''}
              onClick={() => handleSelectMenu('Automação')}
            >
              <Link to="/automate">
                <PiPlayCircle />
                {!isCollapsed && 'Automação'}
              </Link>
            </li>
            <Divider className="divider" />
            {/* <li
              className={selectedMenu === 'Novo Usuário' ? 'active' : ''}
              onClick={() => handleSelectMenu('Novo Usuário')}
            >
              <Link to="/users/new">
                <PiUserCirclePlus />
                {!isCollapsed && 'Novo Usuário'}
              </Link>
            </li> */}
            <li
              className={selectedMenu === 'Usuários' ? 'active' : ''}
              onClick={() => handleSelectMenu('Usuários')}
            >
              <Link to="/users">
                <PiUsers />
                {!isCollapsed && 'Usuários'}
              </Link>
            </li>
          </>
        )}
        {user.role === 'offer_manager' && (
          <>
            <li>
              {!isCollapsed && <span className="section-title">Promoções</span>}
            </li>
            <li
              className={selectedMenu === 'Nova Oferta' ? 'active' : ''}
              onClick={() => handleSelectMenu('Nova Oferta')}
            >
              <Link to="/offers/new">
                <PiSealPercent />
                {!isCollapsed && 'Nova Oferta'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Ofertas' ? 'active' : ''}
              onClick={() => handleSelectMenu('Ofertas')}
            >
              <Link to="/offers">
                <PiTag />
                {!isCollapsed && 'Ofertas'}
              </Link>
            </li>
            <Divider className="divider" />
            <li>
              {!isCollapsed && <span className="section-title">Marketing</span>}
            </li>
            <li
              className={selectedMenu === 'Criar Cartaz' ? 'active' : ''}
              onClick={() => handleSelectMenu('Criar Cartaz')}
            >
              <Link to="/">
                <PiIdentificationBadge />
                {!isCollapsed && 'Criar Cartaz'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Campanhas' ? 'active' : ''}
              onClick={() => handleSelectMenu('Campanhas')}
            >
              <Link to="/campaigns">
                <PiFileImage />
                {!isCollapsed && 'Campanhas'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Imprimir' ? 'active' : ''}
              onClick={() => handleSelectMenu('Imprimir')}
            >
              <Link to="/print">
                <PiPrinter />
                {!isCollapsed && 'Imprimir'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Automação' ? 'active' : ''}
              onClick={() => handleSelectMenu('Automação')}
            >
              <Link to="/automate">
                <PiPlayCircle />
                {!isCollapsed && 'Automação'}
              </Link>
            </li>
          </>
        )}
        {user.role === 'print_only' && (
          <>
            <Divider className="divider" />
            <li
              className={selectedMenu === 'Nova Oferta' ? 'active' : ''}
              onClick={() => handleSelectMenu('Nova Oferta')}
            >
              <Link to="/offers/new">
                <PiSealPercent />
                {!isCollapsed && 'Nova Oferta'}
              </Link>
            </li>
            <li>
              {!isCollapsed && <span className="section-title">Marketing</span>}
            </li>
            <li
              className={selectedMenu === 'Criar Cartaz' ? 'active' : ''}
              onClick={() => handleSelectMenu('Criar Cartaz')}
            >
              <Link to="/">
                <PiIdentificationBadge />
                {!isCollapsed && 'Criar Cartaz'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Imprimir' ? 'active' : ''}
              onClick={() => handleSelectMenu('Imprimir')}
            >
              <Link to="/print">
                <PiPrinter />
                {!isCollapsed && 'Imprimir'}
              </Link>
            </li>
            <li
              className={selectedMenu === 'Automação' ? 'active' : ''}
              onClick={() => handleSelectMenu('Automação')}
            >
              <Link to="/automate">
                <PiPlayCircle />
                {!isCollapsed && 'Automação'}
              </Link>
            </li>
          </>
        )}
      </ul>
    </Container>
  )
}
