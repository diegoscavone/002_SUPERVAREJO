import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Trash2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CirclePlay,
  Loader2,
  CheckCircle2Icon,
  PackageOpen,
  CalendarClock,
  Minus,
  TrendingDown,
  TrendingUp,
  Boxes
} from 'lucide-react'

// Serviços e Hooks
import { useAuth } from '../../hooks/auth'
import { useCreatedPoster } from '../../hooks/createdPoster'
import { api, apiERP } from '../../services/api'
import {
  toastError,
  toastInfo,
  toastSuccess
} from '../../styles/toastConfig.js'

// Componentes da Aplicação
import { Layout } from '@/components/Layout'
import { DataTable } from '@/components/DataTable'
import { InputMask } from '@/components/InputMask'
import { PriceCell } from '@/components/PriceCell'
import { BarcodeScanner } from '@/components/BarcodeScanner'
import { InputCustom } from '@/components/InputCustom'
import { SelectCustom } from '@/components/SelectCustom'

// Componentes shadcn/ui
import { Button } from '@/components/Button'
import { Card, CardContent } from '@/components/ui/card'

export function ProductsValidity() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()
  const { user } = useAuth()
  const userUnit = user?.unit || user?.unidade || user?.unid_codigo

  const codeInputRef = useRef(null)

  // Estados dos Produtos
  const [productsList, setProductsList] = useState([])
  const [productBatch, setProductBatch] = useState('')
  const [productQuantity, setProductQuantity] = useState('')
  const [productValidity, setProductValidity] = useState('')
  const [fetchedProduct, setFetchedProduct] = useState(null)
  const [productSearch, setProductSearch] = useState({
    id: '',
    description: ''
  })

  // Estados de Controle
  const [loading, setLoading] = useState(false)
  const [isAutomating, setIsAutomating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  // Carregar Campanhas
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await api.get('campaigns')
        setCampaigns(response.data || [])
      } catch (err) {
        console.error('Erro ao carregar campanhas:', err)
      }
    }
    fetchCampaigns()
  }, [])

  const calculateProfit = useCallback((cost, price) => {
    const numCost = parseFloat(cost) || 0
    const numPrice = parseFloat(price) || 0
    if (numPrice <= 0) return '0.0'
    return (((numPrice - numCost) / numPrice) * 100).toFixed(1)
  }, [])

  const formatCurrency = useCallback(value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value) || 0)
  }, [])

  // Buscar Produtos de Validade
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get(`/productsValidity?unit=${userUnit}`)

      const formattedProducts = (response.data || []).map(p => {
        let pureDate = new Date()
        if (p.final_date) {
          const dateOnly = p.final_date.split('T')[0]
          const [year, month, day] = dateOnly.split('-')
          pureDate = new Date(Number(year), Number(month) - 1, Number(day))
        }

        const cost = Number(p.cost_price ?? p.custoempresa ?? p.custo ?? 0)
        const currentOffer = p.offer_price ? Number(p.offer_price) : 0

        return {
          ...p,
          barcode: p.barcode || p.codigobarras || p.prod_codbarras || 'N/A',
          cost_price: cost,
          validadeObj: pureDate,
          profit: calculateProfit(cost, currentOffer)
        }
      })

      setProductsList(formattedProducts)
    } catch (error) {
      toastError('Erro ao buscar produtos.')
    } finally {
      setLoading(false)
    }
  }, [userUnit, calculateProfit])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Busca do Produto no ERP
  async function handleProductSearch(scannedCode = null) {
    const targetId = scannedCode || productSearch.id

    if (!targetId) {
      return toastInfo('Digite ou escaneie um produto para buscar.')
    }

    try {
      setLoading(true)
      const response = await apiERP.get(`/products/${targetId}`, {
        params: { unit: userUnit }
      })

      const productInfo =
        response.data.products && response.data.products.length > 0
          ? response.data.products[0]
          : response.data

      if (productInfo && (productInfo.prod_codigo || productInfo.codigo)) {
        setFetchedProduct(productInfo)
        setProductSearch({
          id: targetId,
          description: productInfo.prod_descricao || productInfo.descricao || ''
        })
      } else {
        toastError('Produto não encontrado.')
        setFetchedProduct(null)
        setProductSearch({ ...productSearch, id: targetId, description: '' })
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toastError(`Erro ao buscar produto ${targetId}`)
      setFetchedProduct(null)
    } finally {
      setLoading(false)
    }
  }

  // Scan via Câmera
  const handleScan = useCallback(
    code => {
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
      setShowScanner(false)
      handleProductSearch(code)
    },
    [userUnit]
  )

  const resetForm = () => {
    setProductSearch({ id: '', description: '' })
    setProductBatch('')
    setProductQuantity('')
    setProductValidity('')
    setFetchedProduct(null)
    codeInputRef.current?.focus()
  }

  // Adicionar Produto ao Controle de Validade
  const handleAddProduct = async () => {
    if (!fetchedProduct || !productValidity) {
      return toastInfo('Preencha a validade antes de adicionar.')
    }

    try {
      const [day, month, year] = productValidity.split('/')
      const isoDate = `${year}-${month}-${day}T00:00:00.000Z`

      // Captura segura de custo e ean do ERP
      const costValue = Number(
        fetchedProduct.custoempresa ??
        fetchedProduct.prun_ctempresa ??
        fetchedProduct.prod_preco_custo ??
        0
      )

      const barcodeValue = String(
        fetchedProduct.codigobarras ??
        fetchedProduct.prod_codbarras ??
        ''
      ).trim()

      const salePrice = Number(
        fetchedProduct.prvenda ??
        fetchedProduct.prun_prvenda ??
        fetchedProduct.prod_preco_venda ??
        0
      )

      const newProduct = {
        product_id: String(fetchedProduct.prod_codigo || fetchedProduct.codigo),
        barcode: barcodeValue || 'N/A',
        description: fetchedProduct.prod_descricao || fetchedProduct.descricao,
        complement: fetchedProduct.prod_complemento || fetchedProduct.complemento || '',
        packaging: fetchedProduct.prod_emb || fetchedProduct.embalagem || 'UN',
        cost_price: costValue,
        price: salePrice,
        final_date: isoDate,
        lote: productBatch,
        quantity: parseFloat(String(productQuantity).replace(',', '.')) || 0,
        unit: userUnit,
        user_id: user?.id
      }

      await api.post('/productsValidity', { products: [newProduct] })
      toastSuccess('Produto adicionado com sucesso!')

      window.dispatchEvent(new CustomEvent('productAdded'))

      setTimeout(() => {
        fetchProducts()
        resetForm()
      }, 200)
    } catch (error) {
      toastError('Erro ao salvar no controle de validade.')
    }
  }

  // Exclusão em lote
  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id])

    if (selectedIds.length === 0) {
      return toastInfo('Nenhum produto selecionado para exclusão.')
    }

    try {
      setIsDeleting(true)
      await Promise.all(
        selectedIds.map(id => api.delete(`/productsValidity/${id}`))
      )

      setProductsList(prev => prev.filter(p => !selectedIds.includes(String(p.id))))
      setSelectedRows({})
      toastSuccess(`${selectedIds.length} produto(s) removido(s) com sucesso.`)

      window.dispatchEvent(new CustomEvent('productAdded'))
    } catch (error) {
      console.error('Erro ao deletar produtos:', error)
      toastError('Erro ao remover produtos selecionados.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Atualizar Preço de Oferta
  const updateOfferPrice = async (productId, newPrice) => {
    try {
      await api.put(`/productsValidity/${productId}`, { offer_price: newPrice })
      setProductsList(prev =>
        prev.map(p =>
          p.id === productId
            ? {
                ...p,
                offer_price: newPrice,
                profit: calculateProfit(p.cost_price, parseFloat(newPrice) || 0)
              }
            : p
        )
      )
    } catch (error) {
      toastError('Erro ao atualizar preço de oferta.')
    }
  }

  const handleRowUpdate = useCallback(
    (rowIndex, columnId, value) => {
      setProductsList(prev => {
        const newData = [...prev]
        const item = { ...newData[rowIndex] }

        if (item[columnId] === value) return prev

        item[columnId] = value

        if (columnId === 'offer_price') {
          item.profit = calculateProfit(item.cost_price, parseFloat(value) || 0)
          updateOfferPrice(item.id, value)
        }

        newData[rowIndex] = item
        return newData
      })
    },
    [calculateProfit]
  )

  const handleGeneratePosters = async () => {
    const selectedIds = Object.keys(selectedRows).filter(id => selectedRows[id])

    if (selectedIds.length === 0) {
      return toastInfo('Selecione pelo menos um produto na tabela.')
    }

    if (!campaignSelected || campaignSelected === '0') {
      return toastInfo('Selecione uma campanha promocional.')
    }

    try {
      setIsAutomating(true)

      const selectedProducts = productsList.filter(p =>
        selectedIds.includes(String(p.id))
      )

      const productsToCreate = selectedProducts.filter(p => {
        const rawPrice = String(p.offer_price || '').replace(',', '.')
        const numPrice = parseFloat(rawPrice)
        return !isNaN(numPrice) && numPrice > 0
      })

      if (productsToCreate.length === 0) {
        setIsAutomating(false)
        return toastInfo('Nenhum dos produtos selecionados possui preço de oferta preenchido.')
      }

      let existingPosters = []
      try {
        const resPosters = await api.get('/posters')
        existingPosters = resPosters.data || []
      } catch (err) {
        console.warn('Não foi possível verificar duplicidades:', err)
      }

      let createdCount = 0
      let skippedCount = 0

      for (const product of productsToCreate) {
        const rawOffer = String(product.offer_price).replace(',', '.')
        const numericPrice = parseFloat(rawOffer)
        const formattedPrice = numericPrice.toFixed(2).replace('.', ',')

        const prodId = String(product.product_id)
        const unitFormatted = String(userUnit || '')

        const isDuplicate = existingPosters.some(ep => {
          const epPrice = String(ep.price || '')
            .replace('R$', '')
            .trim()
          return (
            String(ep.product_id) === prodId &&
            String(ep.campaign_id) === String(campaignSelected) &&
            epPrice === formattedPrice &&
            String(ep.unit || '') === unitFormatted
          )
        })

        if (isDuplicate) {
          skippedCount++
          continue
        }

        const [priceInteger, priceDecimal = ''] = formattedPrice.split(',')
        const posterPayload = {
          product_id: prodId,
          description: product.description,
          complement: product.complement || '',
          packaging: product.packaging || 'UN',
          price: formattedPrice,
          price_retail: formattedPrice,
          price_wholesale: formattedPrice,
          priceInteger,
          priceDecimal: priceDecimal ? `,${priceDecimal}` : '',
          unit: userUnit
        }

        const dateInit = new Date().toLocaleDateString('pt-BR')
        const dateEnd =
          product.validadeObj instanceof Date && !isNaN(product.validadeObj)
            ? product.validadeObj.toLocaleDateString('pt-BR')
            : dateInit

        await handleCreatePoster(
          posterPayload,
          dateInit,
          dateEnd,
          String(campaignSelected),
          '1'
        )

        createdCount++
      }

      if (createdCount > 0) {
        toastSuccess(`${createdCount} cartaz(es) criado(s) com sucesso!`)
        if (skippedCount > 0) {
          toastInfo(`${skippedCount} item(ns) duplicados foram ignorados.`)
        }
        setTimeout(() => navigate('/print'), 1500)
      } else {
        toastInfo('Todos os itens selecionados já possuem cartazes idênticos.')
        setIsAutomating(false)
      }
    } catch (error) {
      console.error('Erro na automação de cartazes:', error)
      toastError('Falha ao processar automação de cartazes.')
      setIsAutomating(false)
    }
  }

  const MARGIN_THEME = {
    CRITICAL: {
      max: 14.9,
      colorClass: 'text-rose-600 dark:text-rose-400',
      dotClass: 'bg-rose-500 shadow-rose-500/30',
      icon: TrendingDown
    },
    WARNING: {
      max: 25,
      colorClass: 'text-amber-600 dark:text-amber-400',
      dotClass: 'bg-amber-500 shadow-amber-500/30',
      icon: Minus
    },
    SUCCESS: {
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      dotClass: 'bg-emerald-500 shadow-emerald-500/30',
      icon: TrendingUp
    }
  }

  // Definição das colunas com larguras enxutas para evitar scroll horizontal
  const columns = useMemo(
    () => [
      {
        accessorKey: 'product_id',
        header: 'Cód.',
        cell: ({ getValue }) => (
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {getValue()}
          </span>
        )
      },
      {
        accessorKey: 'barcode',
        header: 'EAN',
        cell: ({ getValue }) => {
          const val = getValue()
          return (
            <span className="text-zinc-700 whitespace-nowrap">
              {val && val !== 'N/A' ? val : '—'}
            </span>
          )
        }
      },
      {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => {
          const validade = row.original.validadeObj
          const today = new Date()
          const diffDays = Math.ceil((validade - today) / (1000 * 60 * 60 * 24))

          let statusColor = 'text-emerald-600 dark:text-emerald-400'
          let Icon = CheckCircle2
          if (diffDays <= 7) {
            statusColor = 'text-rose-600 dark:text-rose-400'
            Icon = AlertTriangle
          } else if (diffDays <= 15) {
            statusColor = 'text-amber-600 dark:text-amber-400'
            Icon = Clock
          }

          return (
            <div
              className="flex items-center gap-1.5 max-w-[180px] xl:max-w-[230px]"
              title={row.original.description}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${statusColor}`} />
              <span className="font-medium truncate">
                {row.original.description}
              </span>
            </div>
          )
        }
      },
      {
        accessorKey: 'quantity',
        header: 'Qtd',
        cell: ({ row }) => {
          const qty = Number(row.original.quantity || 0)
          return (
            <span className="inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded bg-muted/60 text-foreground whitespace-nowrap">
              <Boxes className="h-2.5 w-2.5 text-muted-foreground" />
              {qty % 1 === 0 ? qty : qty.toFixed(1)}
              <span className="text-[9px] text-muted-foreground uppercase">
                {row.original.packaging || 'UN'}
              </span>
            </span>
          )
        }
      },
      {
        accessorKey: 'final_date',
        header: 'Validade',
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-medium">
            {new Date(getValue()).toLocaleDateString('pt-BR')}
          </span>
        )
      },
      {
        accessorKey: 'cost_price',
        header: 'Custo',
        cell: ({ getValue }) => (
          <span className="text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            {formatCurrency(getValue())}
          </span>
        )
      },
      {
        accessorKey: 'price',
        header: 'Venda',
        cell: ({ getValue }) => (
          <span className="font-medium whitespace-nowrap">
            {formatCurrency(getValue())}
          </span>
        )
      },
      {
        accessorKey: 'offer_price',
        header: 'Oferta',
        cell: ({ row }) => (
          <div className="w-[70px]">
            <PriceCell
              value={row.original.offer_price}
              index={row.index}
              onUpdate={newValue =>
                handleRowUpdate(row.index, 'offer_price', newValue)
              }
            />
          </div>
        )
      },
      {
        accessorKey: 'profit',
        header: 'Margem',
        cell: ({ row }) => {
          const custo = parseFloat(row.original.cost_price) || 0
          const preco =
            parseFloat(
              String(row.original.offer_price || '').replace(',', '.')
            ) || 0
          const margemNum = preco > 0 ? ((preco - custo) / preco) * 100 : 0
          const margemFormatada = margemNum.toFixed(1)

          let config = MARGIN_THEME.SUCCESS
          if (margemNum <= MARGIN_THEME.CRITICAL.max) {
            config = MARGIN_THEME.CRITICAL
          } else if (margemNum <= MARGIN_THEME.WARNING.max) {
            config = MARGIN_THEME.WARNING
          }

          const IconComponent = config.icon

          return (
            <div className="flex items-center gap-1 select-none whitespace-nowrap">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dotClass}`}
              />
              <span
                className={`font-bold tracking-tight ${config.colorClass}`}
              >
                {margemFormatada}%
              </span>
              <IconComponent
                className={`h-3 w-3 shrink-0 ${config.colorClass}`}
                strokeWidth={2.5}
              />
            </div>
          )
        }
      }
    ],
    [handleRowUpdate, formatCurrency]
  )

  const selectedCount = Object.keys(selectedRows).filter(
    id => selectedRows[id]
  ).length

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:px-6 space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-4 sm:p-5 rounded-xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold tracking-tight text-green-600">
                Gestão de Validades
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Faça o controle de validades dos produtos nas gôndolas e automatize cartazes.
            </p>
          </div>
        </div>

        {/* Formulário de Cadastro */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-3.5 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-3 items-end">
              {/* Código + Busca */}
              <div className="lg:col-span-2 space-y-1">
                <div className="flex items-end gap-1.5">
                  <div className="relative flex-1">
                    <InputCustom
                      label="Código / EAN"
                      id="product_code"
                      ref={codeInputRef}
                      type="text"
                      icon={Search}
                      placeholder="Ex: 10452"
                      value={productSearch.id}
                      onChange={e =>
                        setProductSearch({
                          ...productSearch,
                          id: e.target.value
                        })
                      }
                      onEnter={() => handleProductSearch()}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleProductSearch()}
                    disabled={loading}
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-green-600 hover:bg-green-700 text-white sm:hidden"
                    title="Buscar produto"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Descrição */}
              <div className="lg:col-span-4 space-y-1">
                <InputCustom
                  label="Descrição do Produto"
                  value={productSearch.description}
                  placeholder="Nome do produto consultado..."
                  readOnly
                  className="h-10 bg-muted/40 font-medium text-zinc-700 dark:text-zinc-200"
                />
              </div>

              {/* Lote */}
              <div className="lg:col-span-2 space-y-1">
                <InputCustom
                  label="Lote"
                  id="batch"
                  value={productBatch}
                  onChange={e => setProductBatch(e.target.value)}
                  placeholder="Ex: L12"
                  className="h-10"
                />
              </div>

              {/* Quantidade */}
              <div className="lg:col-span-1 space-y-1">
                <InputCustom
                  label="Qtd."
                  id="product_quantity"
                  type="number"
                  step="any"
                  min="0"
                  value={productQuantity}
                  onChange={e => setProductQuantity(e.target.value)}
                  placeholder="Ex: 10"
                  className="h-10"
                />
              </div>

              {/* Validade */}
              <div className="lg:col-span-2 space-y-1">
                <InputMask
                  id="validity_date"
                  name="validity_date"
                  label="Data de Validade"
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  value={productValidity}
                  onChange={e => setProductValidity(e.target.value)}
                  icon={CalendarDays}
                  showCalendar={true}
                  className="h-10"
                />
              </div>

              {/* Botão Salvar */}
              <div className="lg:col-span-1">
                <Button
                  label="Salvar"
                  type="button"
                  color="orange"
                  className="w-full h-10 font-semibold"
                  onClick={handleAddProduct}
                  disabled={!fetchedProduct}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanner Overlay Mobile */}
        {showScanner && (
          <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-sm relative flex flex-col items-center gap-4">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-orange-500 relative">
                <BarcodeScanner onScanSuccess={handleScan} />
              </div>
              <p className="text-white/80 text-xs text-center font-medium">
                Aponte a câmera para o código de barras
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setShowScanner(false)}
              >
                Fechar Scanner
              </Button>
            </div>
          </div>
        )}

        {/* Tabela de Produtos */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardContent className="p-2 sm:p-4">
            {productsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                  <PackageOpen className="h-7 w-7 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Nenhum produto cadastrado
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Não localizamos nenhum produto com data de vencimento registrada para esta filial.
                </p>
              </div>
            ) : (
              <div>
                <DataTable
                  data={productsList}
                  columns={columns}
                  loading={loading}
                  enableRowSelection={true}
                  onRowSelect={setSelectedRows}
                  rowSelection={selectedRows}
                  defaultPageSize={30}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barra Flutuante de Ações em Lote */}
        {selectedCount > 0 && (
          <div className="sticky bottom-6 z-20 flex justify-center animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-zinc-900 text-white dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-2xl border border-white/10 w-full sm:w-auto">
              {/* Contador */}
              <div className="flex items-center gap-2 shrink-0">
                <CirclePlay className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-semibold tracking-wide">
                  {selectedCount} item(ns) selecionado(s)
                </span>
              </div>

              {/* Seleção de Campanha */}
              <div className="w-full sm:w-56 text-zinc-800 dark:text-zinc-100">
                <SelectCustom
                  id="campaign_automate_select"
                  placeholder="Selecione a Campanha"
                  value={campaignSelected || undefined}
                  onValueChange={setCampaignSelected}
                  className="h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 text-xs rounded-xl"
                  options={[
                    { value: '0', label: 'Sem campanha específica' },
                    ...campaigns.map(c => ({
                      value: String(c.id),
                      label: c.name
                    }))
                  ]}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting || isAutomating}
                  className="w-full sm:w-auto h-9 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 rounded-xl shadow-xs gap-1.5 shrink-0"
                  title="Excluir itens selecionados"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleGeneratePosters}
                  disabled={isAutomating || isDeleting}
                  className="w-full sm:w-auto h-9 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 rounded-xl shadow-xs gap-1.5 shrink-0"
                >
                  {isAutomating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="h-4 w-4" />
                  )}
                  <span>
                    {isAutomating ? 'Processando...' : 'Iniciar Automação'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}