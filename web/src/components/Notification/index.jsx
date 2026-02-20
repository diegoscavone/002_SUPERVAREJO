import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/auth'
import { api } from '../../services/api'
import { USER_ROLE } from '../../utils/roles'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bell, CalendarDays, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Notification() {
  const [products, setProducts] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()
  const userUnit = user.unit || user.unidade || user.unid_codigo

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get(`/productsValidity?unit=${userUnit}`)
      const productsData = response.data.map(product => ({
        ...product,
        validade: new Date(product.final_date)
      }))

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const expirationLimit = new Date()
      expirationLimit.setDate(today.getDate() + 20)

      const expiringProducts = productsData.filter(product => {
        return product.validade <= expirationLimit && product.validade >= today
      })

      setProducts(expiringProducts)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }, [userUnit])

  useEffect(() => {
    const isAuthorized = [USER_ROLE.ADMIN.value, USER_ROLE.OFFER_MANAGER.value].includes(user.role)
    
    if (isAuthorized) {
      fetchProducts()
    }

    const handleProductAdded = () => fetchProducts()
    window.addEventListener('productAdded', handleProductAdded)

    return () => {
      window.removeEventListener('productAdded', handleProductAdded)
    }
  }, [user.role, fetchProducts])

  if (![USER_ROLE.ADMIN.value, USER_ROLE.OFFER_MANAGER.value].includes(user.role)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-all duration-300"
        >
          <Bell size={20} />
          {products.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-300">
              {products.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-slate-200">
        <DropdownMenuLabel className="px-4 py-3 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-700">
            <AlertCircle size={16} className="text-orange-500" />
            <span className="font-bold text-xs uppercase tracking-tight">Alertas de Vencimento</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none text-[10px]">
            {products.length} itens
          </Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="m-0" />

        <ScrollArea className={`${products.length > 0 ? 'h-[350px]' : 'h-auto'} w-full`}>
          <div className="py-2">
            {products.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                <Bell size={32} className="text-slate-200" />
                <p className="text-sm text-slate-400 italic">Nenhum vencimento para os próximos 20 dias.</p>
              </div>
            ) : (
              products.map((product) => (
                <DropdownMenuItem 
                  key={product.id} 
                  className="px-4 py-3 focus:bg-slate-50 cursor-pointer flex flex-col items-start gap-1 border-b border-slate-50 last:border-0"
                >
                  <span className="font-semibold text-slate-900 text-sm leading-tight">
                    {product.description}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays size={14} className="text-green-600" />
                    <span>Vence em: {product.validade.toLocaleDateString('pt-BR')}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
        
        {products.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 bg-slate-50/50">
              <Button 
                variant="ghost" 
                className="w-full justify-center text-xs font-bold text-green-600 hover:text-green-700 hover:bg-green-100/50"
                onClick={() => {
                navigate('/productsValidity');
              }} 
              >
                Ver Relatório Completo
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}