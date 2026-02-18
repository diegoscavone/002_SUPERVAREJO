import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useCreatedPoster } from '../../hooks/createdPoster'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Layout } from '@/components/Layout'
import { Section } from '../../components/Section'
import { DataTable } from '../../components/DataTable'
import { InputMask } from '../../components/InputMask'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'

import {
  Search,
  Plus,
  Trash2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Barcode,
  CirclePlay,
  Loader2,
  CheckCircle2Icon,
  BarcodeIcon
} from 'lucide-react'

import { useAuth } from '../../hooks/auth'
import { api, apiERP } from '../../services/api'
import {
  toastError,
  toastInfo,
  toastSuccess
} from '../../styles/toastConfig.js'
import { USER_ROLE } from '../../utils/roles.js'
import { Container, Content } from './styles'
import { PriceCell } from '@/components/PriceCell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'

export function ProductsValidity() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()

  const [productsList, setProductsList] = useState([])
  const [productBatch, setProductBatch] = useState('')
  const [productValidity, setProductValidity] = useState('')
  const [fetchedProduct, setFetchedProduct] = useState(null)
  const [productSearch, setProductSearch] = useState({
    id: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [isAutomating, setIsAutomating] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')

  const { user } = useAuth()
  const codeInputRef = useRef(null)
  const userUnit = user.unit || user.unidade || user.unid_codigo

  // --- LÓGICA DE NEGÓCIO ---

  useEffect(() => {
    async function fetchCampaigns() {
      const response = await api.get('campaigns')
      setCampaigns(response.data)
    }
    fetchCampaigns()
  }, [])

  const calculateProfit = useCallback((cost, price) => {
    if (!cost || !price || price <= 0) return 0
    return (((price - cost) / price) * 100).toFixed(1)
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/productsValidity?unit=${userUnit}`)

      const formattedProducts = response.data.map(p => {
        // Garantimos que a data seja tratada como local para evitar problemas de fuso
        const dateParts = p.final_date.split('T')[0].split('-')
        const pureDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

        return {
          ...p,
          validadeObj: pureDate,
          // Calculamos o lucro inicial baseado no que veio do banco
          profit: calculateProfit(p.price, p.offer_price || 0)
        }
      })

      // Remova o .filter() daqui temporariamente para testar se os produtos aparecem
      setProductsList(formattedProducts)
    } catch (error) {
      toastError('Erro ao buscar produtos.')
    } finally {
      setLoading(false)
    }
  }, [userUnit, calculateProfit])

  async function handleProductSearch() {
    if (!productSearch.id) {
      return toastInfo('Digite um produto para buscar.')
    }

    try {
      // Seguindo o padrão de params da Home
      const response = await apiERP.get(`/products/${productSearch.id}`, {
        params: {
          unit: userUnit
        }
      })

      // Lógica de extração de dados igual à Home
      const productInfo =
        response.data.products && response.data.products.length > 0
          ? response.data.products[0]
          : response.data

      if (productInfo) {
        setFetchedProduct(productInfo)
        setProductSearch({
          ...productSearch,
          description: productInfo.prod_descricao || productInfo.descricao
        })

        // Dica sênior: Se quiser preencher o lote automaticamente caso venha da API
        // setProductBatch(productInfo.lote || '')
      } else {
        toastError('Produto não encontrado.')
        setFetchedProduct(null)
        setProductSearch({ ...productSearch, description: '' })
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toastError(`Produto ${productSearch.id} não encontrado.`)
      setFetchedProduct(null)
      setProductSearch({ ...productSearch, description: '' })
    }
  }

  // Ajuste na função de adicionar para garantir que use os campos corretos mapeados
  const handleAddProduct = async () => {
    if (!fetchedProduct || !productValidity) {
      return toastInfo('Preencha a validade antes de adicionar.')
    }

    try {
      const [day, month, year] = productValidity.split('/')
      const isoDate = `${year}-${month}-${day}T00:00:00.000Z`

      const newProduct = {
        product_id: fetchedProduct.prod_codigo || fetchedProduct.codigo,
        description: fetchedProduct.prod_descricao || fetchedProduct.descricao,
        complement:
          fetchedProduct.prod_complemento || fetchedProduct.complemento || '',
        packaging: fetchedProduct.prod_emb || fetchedProduct.embalagem || '',
        price: fetchedProduct.prvenda,
        final_date: isoDate,
        lote: productBatch,
        unit: userUnit,
        user_id: user.id
      }

      await api.post('/productsValidity', { products: [newProduct] })
      toastSuccess('Produto adicionado com sucesso!')

      // Pequeno delay para garantir que o banco processou
      setTimeout(() => {
        fetchProducts()
        resetForm()
      }, 200)
    } catch (error) {
      toastError('Erro ao salvar no controle de validade.')
    }
  }

  const handleRemoveProduct = async id => {
    try {
      await api.delete(`/productsValidity/${id}`)
      setProductsList(prev => prev.filter(p => p.id !== id))
      toastSuccess('Produto Removido.')
    } catch (error) {
      toastError('Erro ao remover.')
    }
  }

  const updateOfferPrice = async (productId, newPrice) => {
    try {
      await api.put(`/productsValidity/${productId}`, { offer_price: newPrice })
      setProductsList(prev =>
        prev.map(p =>
          p.id === productId
            ? {
                ...p,
                offer_price: newPrice,
                profit: calculateProfit(p.price, parseFloat(newPrice) || 0)
              }
            : p
        )
      )
    } catch (error) {
      toastError('Erro ao atualizar preço.')
    }
  }

  const resetForm = () => {
    setProductSearch({ id: '', description: '' })
    setProductBatch('')
    setProductValidity('')
    setFetchedProduct(null)
    codeInputRef.current?.focus()
  }

  const handleGeneratePosters = async () => {
    const selectedIds = Object.keys(selectedRows)

    if (
      selectedIds.length === 0 ||
      !campaignSelected ||
      campaignSelected === '0'
    ) {
      return toastInfo('Selecione os produtos e uma campanha primeiro.')
    }

    try {
      setIsAutomating(true)

      // 1. Buscamos os posters já existentes no banco para comparar
      const responsePosters = await api.get('/posters')
      const existingPosters = responsePosters.data

      const selectedProducts = productsList.filter(p =>
        selectedIds.includes(String(p.id))
      )

      const productsToCreate = selectedProducts.filter(p => {
        const offer = parseFloat(String(p.offer_price).replace(',', '.'))
        return offer > 0
      })

      if (productsToCreate.length === 0) {
        return toastInfo('Nenhum dos produtos possui preço de oferta válido.')
      }

      let createdCount = 0
      let skippedCount = 0

      for (const product of productsToCreate) {
        const formattedPrice = parseFloat(
          String(product.offer_price).replace(',', '.')
        )
          .toFixed(2)
          .replace('.', ',')

        // --- VALIDAÇÃO DE DUPLICIDADE ---
        // Verificamos se já existe um poster para este produto, nesta unidade, com este preço e esta campanha
        const isDuplicate = existingPosters.some(
          ep =>
            String(ep.product_id) === String(product.product_id) &&
            String(ep.campaign_id) === String(campaignSelected) &&
            String(ep.price) === formattedPrice &&
            String(ep.unit) === String(userUnit)
        )

        if (isDuplicate) {
          skippedCount++
          continue // Pula para o próximo produto do loop sem criar
        }

        const productInputs = {
          product_id: product.product_id,
          description: product.description,
          complement: product.complement || '',
          packaging: product.packaging || '',
          price: formattedPrice,
          unit: userUnit
        }

        const dateInit = new Date().toLocaleDateString('pt-BR')
        const dateEnd = product.validadeObj.toLocaleDateString('pt-BR')

        await handleCreatePoster(
          productInputs,
          dateInit,
          dateEnd,
          campaignSelected,
          1
        )
        createdCount++
      }

      // --- FEEDBACK FINAL ---
      if (createdCount > 0) {
        toastSuccess(`${createdCount} cartaz(es) criado(s) com sucesso!`)
        if (skippedCount > 0) {
          toastInfo(
            `${skippedCount} item(ns) já possuíam cartazes idênticos e foram ignorados.`
          )
        }
        setTimeout(() => navigate('/print'), 2000)
      } else {
        toastInfo('Os itens selecionados já possuem cartazes gerados.')
        setIsAutomating(false)
      }
    } catch (error) {
      console.error(error)
      toastError('Falha ao processar automação.')
      setIsAutomating(false)
    }
  }

  const handleRowUpdate = useCallback(
    (rowIndex, columnId, value) => {
      setProductsList(prev => {
        const newData = [...prev]
        const item = { ...newData[rowIndex] }

        if (item[columnId] === value) return prev

        item[columnId] = value

        // Se for o preço de oferta, atualiza o lucro localmente
        if (columnId === 'offer_price') {
          item.profit = calculateProfit(item.price, parseFloat(value) || 0)
          // Dispara a atualização na API
          updateOfferPrice(item.id, value)
        }

        newData[rowIndex] = item
        return newData
      })
    },
    [calculateProfit, updateOfferPrice]
  )

  const columns = useMemo(
    () => [
      { accessorKey: 'product_id', header: 'Código' },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => {
          const validade = row.original.validadeObj
          const today = new Date()
          const diffDays = Math.ceil((validade - today) / (1000 * 60 * 60 * 24))

          let statusColor = 'text-green-600'
          let Icon = CheckCircle2
          if (diffDays <= 7) {
            statusColor = 'text-red-600'
            Icon = AlertTriangle
          } else if (diffDays <= 15) {
            statusColor = 'text-yellow-600'
            Icon = Clock
          }

          return (
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${statusColor}`} />
              <span className="font-medium">{row.original.description}</span>
            </div>
          )
        }
      },
      { accessorKey: 'lote', header: 'Lote' },
      {
        accessorKey: 'final_date',
        header: 'Validade',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('pt-BR')
      },
      {
        accessorKey: 'price',
        header: 'Venda (R$)',
        cell: ({ getValue }) =>
          new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(getValue())
      },
      {
        accessorKey: 'offer_price',
        header: 'Oferta (R$)',
        cell: ({ row }) => (
          <PriceCell
            value={row.original.offer_price}
            index={row.index} // <--- Passando o índice da linha da tabela
            onUpdate={newValue =>
              handleRowUpdate(row.index, 'offer_price', newValue)
            }
          />
        )
      },
      {
        accessorKey: 'profit',
        header: 'Margem',
        cell: ({ getValue }) => {
          const profit = parseFloat(getValue())
          let variant = 'success'
          if (profit < 15) variant = 'destructive'
          else if (profit < 30) variant = 'warning'

          return (
            <Badge variant={variant} className="rounded-full">
              {profit}%
            </Badge>
          )
        }
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            className="bg-red-50 text-red-500 hover:text-red-500 hover:bg-red-100 h-8 w-8"
            onClick={() => handleRemoveProduct(row.original.id)}
          >
            <Trash2 size={18} />
          </Button>
        )
      }
    ],
    [productsList, calculateProfit, handleRowUpdate]
  )

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <Section title="Gestão de Validade">
            {/* FORMULÁRIO DE ENTRADA - items-end garante o alinhamento no bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white  rounded-xl items-end">
              <Field className="flex flex-col gap-2">
                <FieldLabel>Código</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    value={productSearch.id}
                    onChange={e =>
                      setProductSearch({ ...productSearch, id: e.target.value })
                    }
                    onKeyDown={e => e.key === 'Enter' && handleProductSearch()}
                  />
                  <InputGroupAddon align="inline-start">
                    <Search size={16} />
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field className="flex flex-col gap-2 lg:col-span-1">
                <FieldLabel>Descrição</FieldLabel>
                <Input value={productSearch.description} readOnly />
              </Field>

              <Field className="flex flex-col gap-2">
                <FieldLabel>Lote</FieldLabel>
                <Input
                  value={productBatch}
                  onChange={e => setProductBatch(e.target.value)}
                  placeholder="Ex: A1"
                />
              </Field>

              <Field className="flex flex-col gap-2">
                <FieldLabel>Validade</FieldLabel>
                <InputMask
                  mask="00/00/0000"
                  value={productValidity}
                  onChange={e => setProductValidity(e.target.value)}
                  icon={CalendarDays}
                />
              </Field>

              {/* Botão alinhado perfeitamente ao bottom */}
              <div className="flex justify-start">
                {' '}
                {/* Garante que o botão não estique horizontalmente */}
                <Button
                  onClick={handleAddProduct}
                  disabled={!fetchedProduct}
                  // Mudamos w-full para w-fit e adicionamos px-6 para um respiro interno elegante
                  className="bg-orange-500 hover:bg-orange-600 h-10 w-fit px-6 shadow-none transition-all"
                >
                  <BarcodeIcon className="mr-2 h-4 w-4" /> Adicionar
                </Button>
              </div>
            </div>
          </Section>

          {/* BARRA DE AUTOMAÇÃO (Aparece ao selecionar itens) */}
          {Object.keys(selectedRows).length > 0 && (
            <div className="flex flex-col md:flex-row items-center gap-4 bg-orange-50 border border-orange-100 p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-orange-800">
                <CirclePlay size={20} />
                <span className="text-sm font-bold">
                  Automação: {Object.keys(selectedRows).length} item(ns)
                </span>
              </div>

              <div className="flex-1 max-w-xs">
                <Select
                  onValueChange={setCampaignSelected}
                  value={campaignSelected}
                >
                  <SelectTrigger className="bg-white border-orange-200 focus:ring-orange-500 shadow-none">
                    <SelectValue placeholder="Selecione a Campanha" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGeneratePosters}
                disabled={isAutomating}
                className="bg-green-600 hover:bg-green-700 text-white shadow-none min-w-[160px]"
              >
                {isAutomating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                )}
                {isAutomating ? 'Criando...' : 'Iniciar Automação'}
              </Button>
            </div>
          )}

          <Section>
            <DataTable
              data={productsList}
              columns={columns}
              loading={loading}
              enableRowSelection={true}
              onRowSelect={setSelectedRows}
              rowSelection={selectedRows}
            />
          </Section>
        </Content>
      </Container>
    </Layout>
  )
}
