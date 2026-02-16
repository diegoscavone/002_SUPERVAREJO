import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PiCalendarDots,
  PiMagnifyingGlass,
  PiPlus,
  PiTrash
} from 'react-icons/pi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Button } from '../../components/Button'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Input } from '../../components/Input'
import { InputMask } from '../../components/InputMask/index.jsx'
import { Nav } from '../../components/Nav'
import { Section } from '../../components/Section'
import { useAuth } from '../../hooks/auth'
import { api } from '../../services/api'
import { apiERP } from '../../services/api.js'
import {
  ActionButton,
  ActionButtons,
  Card,
  CardBody,
  CardHeader,
  Container,
  Content,
  Form,
  InputWrapper,
  Label,
  MobileLabel,
  OfferPriceInput,
  ProductCounter,
  ProfitIndicator,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  ValidityIndicator
} from './styles'
import { toastError, toastSuccess } from '../../styles/toastConfig.js'
import { USER_ROLE } from '../../utils/roles.js'

export function ProductsValidity() {
  const [productsList, setProductsList] = useState([])
  const [productDescription, setProductDescription] = useState('')
  const [productBatch, setProductBatch] = useState('')
  const [productValidity, setProductValidity] = useState('')
  const [fetchedProduct, setFetchedProduct] = useState(null)
  const [product, setProduct] = useState({ id: '', description: '' })
  const [isMobile, setIsMobile] = useState(false)

  const { user } = useAuth()
  const codeInputRef = useRef(null)

  const userUnit = user.unit || user.unidade || user.unid_codigo

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  const handleAddProduct = async () => {
    if (!fetchedProduct) {
      toast.error('Busque um produto válido antes de inserir.')
      return
    }

    const [day, month, year] = productValidity.split('/')
    const isoDate = new Date(`${year}-${month}-${day}`).toISOString()

    const newProduct = {
      product_id: fetchedProduct.codigo,
      description: fetchedProduct.descricao,
      complement: fetchedProduct.complemento,
      packaging: fetchedProduct.embalagem,
      price: fetchedProduct.prvenda,
      final_date: isoDate,
      lote: productBatch,
      unit: fetchedProduct.unidade,
      user_id: user.id
    }

    try {
      await api.post('/productsValidity', { products: [newProduct] })
      toastSuccess('Produto adicionado com sucesso.')
      fetchProducts()
      resetForm()
      window.dispatchEvent(new Event('productAdded'))
    } catch (error) {
      toastError('Erro ao adicionar produto.')
      console.error(error)
    }
  }

  const handleRemoveProduct = async id => {
    try {
      await api.delete(`/productsValidity/${id}`)
      setProductsList(prevList => prevList.filter(p => p.id !== id))
      toastSuccess('Produto removido com sucesso.')
      window.dispatchEvent(new Event('productAdded'))
    } catch (error) {
      toastError('Erro ao remover produto.')
      console.error(error)
    }
  }

  const resetForm = () => {
    setProduct({ id: '' })
    setProductDescription('')
    setProductBatch('')
    setProductValidity('')
    setFetchedProduct(null)
    codeInputRef.current?.focus()
  }

  const getProfitClass = useCallback(profit => {
    const profitNum = parseFloat(profit)
    if (profitNum < 15) return 'negative'
    if (profitNum < 30) return 'warning'
    return 'positive'
  }, [])

  const calculateProfit = useCallback((cost, price) => {
    if (!cost || !price || price <= 0) return 0
    return (((price - cost) / price) * 100).toFixed(1)
  }, [])

  const formatCurrency = useCallback(value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }, [])

  const updateOfferPrice = useCallback(
    (productId, newPrice) => {
      setProductsList(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            return {
              ...product,
              offerPrice: newPrice,
              profit: calculateProfit(
                product.custoempresa,
                parseFloat(newPrice) || 0
              )
            }
          }
          return product
        })
      )
    },
    [calculateProfit]
  )

  const handleOfferPriceBlur = async (productId, value) => {
    const numValue = parseFloat(value)
    if (value === '' || isNaN(numValue)) {
      updateOfferPrice(productId, '0')
    }

    try {
      await api.put(`/productsValidity/${productId}`, { offer_price: value })
      toastSuccess('Preço de oferta atualizado.')
    } catch (error) {
      toastError('Erro ao atualizar preço de oferta.')
      console.error(error)
    }
  }

  const handleKeyDown = useCallback((event, index) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      const inputs = document.querySelectorAll(
        'input[type="number"].offer-price-input'
      )

      if (inputs.length === 0) {
        return
      }

      if (index < inputs.length - 1) {
        const nextInput = inputs[index + 1]
        nextInput.focus()
        nextInput.select()
      } else if (inputs.length > 0) {
        const firstInput = inputs[0]
        firstInput.focus()
        firstInput.select()
      }
    }
  }, [])

  const getValidityColor = validade => {
    const today = new Date()
    const validityDate = new Date(validade)
    const diffTime = validityDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) {
      return 'red'
    } else if (diffDays <= 15) {
      return 'yellow'
    } else {
      return 'green'
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get(`/productsValidity?unit=${userUnit}`)
      const productsData = response.data
        .map(product => ({
          ...product,
          validade: new Date(product.final_date)
        }))
        .filter(product => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return product.validade >= today
        })

      const formattedProducts = productsData.map(product => ({
        ...product,
        codigo: product.product_id,
        descricao: product.description,
        lote: product.lote,
        custoempresa: product.price,
        prvenda: product.price,
        offerPrice: product.offer_price || '',
        profit: calculateProfit(product.price, product.offer_price)
      }))

      setProductsList(formattedProducts)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      toastError('Erro ao buscar produtos.')
    }
  }, [userUnit, calculateProfit])

  useEffect(() => {
    if (
      user.role === USER_ROLE.ADMIN.value ||
      user.role === USER_ROLE.OFFER_MANAGER.value
    ) {
      fetchProducts()
    }
    setTimeout(() => codeInputRef.current?.focus(), 100)
  }, [user.role, fetchProducts])

  async function handleProduct() {
    if (!product.id) {
      return toast.info('Digite um produto para buscar.')
    }

    try {
      const response = await apiERP.get(
        `/products?search=${product.id}&unit=${userUnit}`
      )

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        const productData = response.data[0]
        setFetchedProduct(productData)
        setProduct({ ...product, description: productData.descricao })
      } else {
        toastError('Produto não encontrado.')
        setProduct({ ...product, description: '' })
        setFetchedProduct(null)
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toastError(`Produto ${product.id} não encontrado.`)
      setProduct({ ...product, description: '' })
      setFetchedProduct(null)
    }
  }

  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Section title={'Gestão de Validade'}>
          <Card>
            <CardHeader>
              <Form>
                <InputWrapper>
                  <Label>Código do Produto</Label>
                  <Input
                    type="number"
                    onChange={e =>
                      setProduct({ ...product, id: e.target.value })
                    }
                    icon={PiMagnifyingGlass}
                    name="product_id"
                    id="product_id"
                    value={product.id ?? ''}
                    ref={codeInputRef}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleProduct()
                      }
                    }}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Descrição</Label>
                  <Input
                    type="text"
                    placeholder="Descrição do produto"
                    value={product.description ?? ''}
                    readOnly
                    disabled
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Lote</Label>
                  <Input
                    type="text"
                    placeholder="Lote do produto"
                    value={productBatch}
                    onChange={e => setProductBatch(e.target.value)}
                  />
                </InputWrapper>
                <InputWrapper>
                  <Label>Validade</Label>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="DD/MM/AAAA"
                    icon={PiCalendarDots}
                    value={productValidity}
                    onChange={e => setProductValidity(e.target.value)}
                  />
                </InputWrapper>
                <ActionButtons>
                  <Button
                    title="Adicionar"
                    icon={PiPlus}
                    color="ORANGE"
                    onClick={handleAddProduct}
                    disabled={!fetchedProduct}
                  />
                </ActionButtons>
              </Form>
            </CardHeader>
            <CardBody>
              {productsList.length === 0 ? (
                <div className="empty-state">
                  Nenhum produto cadastrado para controle de validade.
                </div>
              ) : (
                <>
                  <ProductCounter>
                    <span>
                      {productsList.length} produto
                      {productsList.length !== 1 ? 's' : ''} na lista
                    </span>
                  </ProductCounter>

                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Descrição</TableHeader>
                        {!isMobile && <TableHeader>Lote</TableHeader>}
                        <TableHeader>Validade</TableHeader>
                        {!isMobile && <TableHeader>Custo</TableHeader>}
                        {!isMobile && <TableHeader>Venda</TableHeader>}
                        <TableHeader className="column-price">
                          Preço Oferta (R$)
                        </TableHeader>
                        {!isMobile && (
                          <TableHeader className="column-profit">
                            Margem
                          </TableHeader>
                        )}
                        <TableHeader></TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {productsList.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <MobileLabel>Código:</MobileLabel>
                            {product.codigo}
                          </TableCell>
                          <TableCell>
                            <div className='description-content'>
                            <ValidityIndicator
                              color={getValidityColor(product.validade)}
                            />
                            {product.descricao}
                            </div>
                          </TableCell>
                          {!isMobile && <TableCell>{product.lote}</TableCell>}
                          <TableCell>
                            <MobileLabel>Validade:</MobileLabel>
                            {product.validade.toLocaleDateString('pt-BR')}
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              {formatCurrency(product.custoempresa)}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              {formatCurrency(product.prvenda)}
                            </TableCell>
                          )}
                          <TableCell>
                            <MobileLabel>Preço Oferta:</MobileLabel>
                            <OfferPriceInput
                              type="number"
                              min="0"
                              step="0.01"
                              className="offer-price-input"
                              value={product.offerPrice}
                              onChange={e =>
                                updateOfferPrice(product.id, e.target.value)
                              }
                              onBlur={e =>
                                handleOfferPriceBlur(
                                  product.id,
                                  e.target.value
                                )
                              }
                              onKeyDown={e => handleKeyDown(e, index)}
                            />
                          </TableCell>
                          {!isMobile && (
                            <TableCell>
                              <ProfitIndicator
                                className={getProfitClass(product.profit)}
                              >
                                {product.profit}%
                              </ProfitIndicator>
                            </TableCell>
                          )}
                          <TableCell>
                            <ActionButton
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <PiTrash />
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </CardBody>
          </Card>
        </Section>
      </Content>
      <Footer />
    </Container>
  )
}
