import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/auth'

// Importações Shadcn UI
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

// Ícones Lucide
import {
  CalendarClock,
  CirclePlay,
  FileImage,
  Newspaper,
  Printer,
  Tag,
  Tags,
  UsersRound,
  ShieldCheck
} from 'lucide-react'

import iconPrincesa from '../assets/icone_princesa.svg'
import logoPrincesa from '../assets/logo_princesa.svg'
import { cn } from '@/lib/utils'

// Dicionário de tradução de papéis (Roles)
const ROLE_LABELS = {
  admin: 'Administrador',
  offer_manager: 'Gerente de Ofertas',
  print_only: 'Operador de Impressão'
}

export function Nav() {
  const { user } = useAuth()
  const location = useLocation()

  // Retorna as iniciais do nome para o estado colapsado da sidebar
  const getInitials = name => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const roleTranslated = ROLE_LABELS[user?.role] || 'Usuário'

  // Definição dos menus por Role
  const menuGroups = [
    {
      label: 'Gestão de Ofertas',
      roles: ['admin', 'offer_manager'],
      items: [
        {
          title: 'Nova Oferta',
          url: '/offers/new',
          icon: Tag,
          roles: ['admin', 'offer_manager']
        },
        {
          title: 'Ofertas',
          url: '/offers',
          icon: Tags,
          roles: ['admin', 'offer_manager']
        }
      ]
    },

    {
      label: 'Gestão de Validade',
      roles: ['admin', 'offer_manager',],
      items: [
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
        {
          title: 'Usuários',
          url: '/users',
          icon: UsersRound,
          roles: ['admin']
        }
      ]
    }
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Topo / Logotipo com suporte a colapso */}
      <SidebarHeader className="flex items-center justify-center py-4 transition-all duration-300">
        <div className="flex items-center justify-center w-full px-2 group-data-[state=collapsed]:px-0">
          <img
            src={logoPrincesa}
            alt="Supermercados Princesa"
            className="h-16 w-auto transition-all duration-300 block group-data-[state=collapsed]:hidden"
          />
          <img
            src={iconPrincesa}
            alt="Logo"
            className="hidden transition-all duration-300 group-data-[state=collapsed]:block h-12 w-12 object-contain shrink-0"
          />
        </div>
      </SidebarHeader>

      {/* Conteúdo com Grupos de Navegação */}
      <SidebarContent>
        {menuGroups.map((group, idx) => {
          if (!group.roles.includes(user?.role)) return null

          return (
            <SidebarGroup key={idx}>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map(item => {
                  if (!item.roles.includes(user?.role)) return null

                  const isActive = location.pathname === item.url

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        size="lg"
                        className="h-11 rounded-xl transition-all duration-200 
      text-zinc-600 dark:text-zinc-400
      hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100
      data-[active=true]:bg-green-500/10 data-[active=true]:text-green-600 dark:data-[active=true]:text-green-400 data-[active=true]:font-semibold
      group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                        >
                          <item.icon
                            className={cn(
                              '!h-5 !w-5 shrink-0 transition-colors',
                              isActive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400'
                            )}
                          />
                          <span className="text-base tracking-tight truncate group-data-[collapsible=icon]:hidden">
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

      {/* Rodapé: Clicável para abrir o Profile do usuário logado */}
      <SidebarFooter className="p-3 border-t border-border group-data-[state=collapsed]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Meu Perfil"
              className="w-full h-auto py-2 px-2.5 rounded-xl transition-all duration-200 cursor-pointer
                hover:bg-zinc-100 dark:hover:bg-zinc-800/60
                group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
            >
              <Link
                to={user?.id ? `/users/profile/${user.id}` : '/profile'}
                className="flex items-center gap-3 w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              >
                {/* Badge com iniciais */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                  {getInitials(user?.name)}
                </div>

                {/* Informações detalhadas exibidas no menu expandido */}
                <div className="flex flex-col text-left text-sm leading-tight min-w-0 group-data-[state=collapsed]:hidden overflow-hidden">
                  <span className="truncate font-semibold text-foreground text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors">
                    {user?.name || 'Usuário'}
                  </span>
                  <span className="truncate text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 text-green-600 shrink-0" />
                    {roleTranslated}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
