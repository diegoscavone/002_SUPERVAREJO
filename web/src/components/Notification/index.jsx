import { useCallback, useEffect, useRef, useState } from 'react'
import { PiBell, PiCalendarBlank } from 'react-icons/pi'
import { useAuth } from '../../hooks/auth'
import { api } from '../../services/api'
import { USER_ROLE } from '../../utils/roles'
import { Container, Dropdown, NotificationButton } from './styles'
import { Button } from '../ui/button'
import { Bell, SquareArrowOutUpRightIcon } from 'lucide-react'

export function Notification() {
  const [products, setProducts] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const userUnit = user.unit || user.unidade || user.unid_codigo
  const dropdownRef = useRef(null)

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get(`/productsValidity?unit=${userUnit}`)
      const productsData = response.data.map(product => ({
        ...product,
        validade: new Date(product.final_date)
      }))

      const today = new Date()
      const daysUntilExpiration = 20
      const expirationDate = new Date(
        today.setDate(today.getDate() + daysUntilExpiration)
      )

      const expiringProducts = productsData.filter(product => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return product.validade <= expirationDate && product.validade >= today
      })

      setProducts(expiringProducts)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    }
  }, [userUnit])

  useEffect(() => {
    if (
      user.role === USER_ROLE.ADMIN.value ||
      user.role === USER_ROLE.OFFER_MANAGER.value
    ) {
      fetchProducts()
    }

    const handleProductAdded = () => fetchProducts()
    window.addEventListener('productAdded', handleProductAdded)

    return () => {
      window.removeEventListener('productAdded', handleProductAdded)
    }
  }, [user.role, fetchProducts])

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownRef])

  if (
    user.role !== USER_ROLE.ADMIN.value &&
    user.role !== USER_ROLE.OFFER_MANAGER.value
  ) {
    return null
  }

  return (
    <Container ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell/>
        {products.length > 0 && <span>{products.length}</span>}
      </Button>
      {isOpen && (
        <Dropdown>
          <ul>
            {products.length === 0 ? (
              <li>Nenhum produto com vencimento próximo.</li>
            ) : (
              products.map(product => (
                <li key={product.id} className="productList">
                  <span>{product.description}</span>
                  <span className="validity">
                    <PiCalendarBlank size={16} />
                    {product.validade.toLocaleDateString('pt-BR')}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Dropdown>
      )}
    </Container>
  )
}
