import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth'
import avatarPlaceHolder from '../../assets/avatar_placeholder.svg'
import { api } from '../../services/api'

// Importações do Shadcn UI
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar'

// Ícones
import {
  PiSealPercent,
  PiTag,
  PiIdentificationBadge,
  PiPrinter,
  PiFileImage,
  PiPlayCircle,
  PiUsers,
  PiQrCode,
  PiUserCircle
} from 'react-icons/pi'

export function Nav() {
  const { user } = useAuth()
  const location = useLocation()

  const avatarUrl = user.avatar
    ? `${api.defaults.baseURL}/tmp/uploads/${user.avatar}`
    : avatarPlaceHolder

  // Definição dos menus por Role (Lógica mais limpa)
  const menuGroups = [
    {
      label: 'Promoções',
      roles: ['admin', 'offer_manager', 'print_only'],
      items: [
        {
          title: 'Nova Oferta',
          url: '/offers/new',
          icon: PiSealPercent,
          roles: ['offer_manager', 'print_only']
        }, // admin usa a lista geral
        {
          title: 'Ofertas',
          url: '/offers',
          icon: PiTag,
          roles: ['admin', 'offer_manager']
        },
        {
          title: 'Validades',
          url: '/productsValidity',
          icon: PiQrCode,
          roles: ['admin']
        }
      ]
    },
    {
      label: 'Marketing',
      roles: ['admin', 'offer_manager', 'print_only'],
      items: [
        {
          title: 'Cartaz',
          url: '/',
          icon: PiIdentificationBadge,
          roles: ['admin', 'offer_manager', 'print_only']
        },
        {
          title: 'Imprimir',
          url: '/print',
          icon: PiPrinter,
          roles: ['admin', 'offer_manager', 'print_only']
        },
        {
          title: 'Campanhas',
          url: '/campaigns',
          icon: PiFileImage,
          roles: ['admin', 'offer_manager']
        },
        {
          title: 'Automação',
          url: '/automate',
          icon: PiPlayCircle,
          roles: ['admin', 'offer_manager', 'print_only']
        }
      ]
    },
    {
      label: 'Configurações',
      roles: ['admin'],
      items: [
        { title: 'Usuários', url: '/users', icon: PiUsers, roles: ['admin'] }
      ]
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 px-2">
          <img src="/logo_reduzida.svg" className="h-8 w-8" alt="Logo" />
          <span className="font-bold truncate group-data-[collapsible=icon]:hidden">
            Super Varejo
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group, idx) => {
          // Filtra se o grupo deve aparecer para o usuário
          if (!group.roles.includes(user.role)) return null

          return (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map(item => {
                  // Filtra os itens internos por role
                  if (!item.roles.includes(user.role)) return null

                  const isActive = location.pathname === item.url

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.url}>
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              {/* Adicione w-8 h-8 fixo para o avatar não explodir na tela */}
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-full">
                <img
                  src={avatarUrl}
                  className="h-full w-full object-cover"
                  alt="User"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs opacity-70">{user.role}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
