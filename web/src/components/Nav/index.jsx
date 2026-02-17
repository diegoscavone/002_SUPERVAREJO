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

import iconPrincesa from '../../assets/icone_princesa.svg'
import logoPrincesa from '../../assets/logo_princesa.svg'
import {
  CalendarClock,
  CirclePlay,
  FileImage,
  Newspaper,
  Printer,
  Tag,
  UsersRound
} from 'lucide-react'

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
          icon: Tag,
          roles: ['offer_manager', 'print_only']
        }, // admin usa a lista geral
        {
          title: 'Ofertas',
          url: '/offers',
          icon: Tag,
          roles: ['admin', 'offer_manager']
        },
        {
          title: 'Validades',
          url: '/productsValidity',
          icon: CalendarClock,
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
          icon: Newspaper,
          roles: ['admin', 'offer_manager', 'print_only']
        },
        {
          title: 'Imprimir',
          url: '/print',
          icon: Printer,
          roles: ['admin', 'offer_manager', 'print_only']
        },
        {
          title: 'Campanhas',
          url: '/campaigns',
          icon: FileImage,
          roles: ['admin', 'offer_manager']
        },
        {
          title: 'Automação',
          url: '/automate',
          icon: CirclePlay,
          roles: ['admin', 'offer_manager', 'print_only']
        }
      ]
    },
    {
      label: 'Configurações',
      roles: ['admin'],
      items: [
        { title: 'Usuários', url: '/users', icon: UsersRound, roles: ['admin'] }
      ]
    }
  ]

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center justify-center py-4 transition-all duration-300">
        <div className="flex items-center justify-center w-full px-2 group-data-[state=collapsed]:px-0">
          <img
            src={logoPrincesa}
            alt="Supermercados Princesa"
            className="h-18 w-auto transition-all duration-300 block group-data-[state=collapsed]:hidden"
          />
          <img
            src={iconPrincesa}
            alt="Logo"
            className="hidden transition-all duration-300 
                 group-data-[state=collapsed]:block 
                 group-data-[state=collapsed]:h-10! 
                 group-data-[state=collapsed]:w-10! 
                 group-data-[state=collapsed]:scale-100
                 object-contain shrink-0"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group, idx) => {
          // Filtra se o grupo deve aparecer para o usuário
          if (!group.roles.includes(user.role)) return null

          return (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className="text-sm font-medium">
                {group.label}
              </SidebarGroupLabel>
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
                        className={`h-10 transition-all duration-200 hover:bg-green-600 hover:text-white data-[active=true]:bg-green-600 data-[active=true]:text-white`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-6! w-6! shrink-0"/>
                          <span className="text-base font-medium">
                            {item.title}
                          </span>
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

      <SidebarFooter className="p-4 group-data-[state=collapsed]:p-2 overflow-hidden flex-none">
        <SidebarMenu className="overflow-hidden">
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 transition-all duration-300 ease-in-out"
            >
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-full border shrink-0">
                <img
                  src={avatarUrl}
                  className="h-full w-full object-cover"
                  alt="User"
                />
              </div>

              <div className="flex flex-col flex-1 text-left text-sm leading-tight min-w-0 group-data-[state=collapsed]:hidden overflow-hidden whitespace-nowrap">
                <span className="truncate font-semibold text-sm">
                  {user.name}
                </span>
                <span className="truncate text-xs opacity-70">{user.role}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
