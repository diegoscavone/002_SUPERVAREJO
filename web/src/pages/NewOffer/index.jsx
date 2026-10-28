import {
  Barcode,
  CalendarDays,
  CloudAlert,
  CloudCheck,
  Loader2,
  Minus,
  PackageOpen,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Serviços e Hooks
import { useAuth } from '../../hooks/auth'
import { useCreatedPoster } from '../../hooks/createdPoster'
import { api, apiERP } from '../../services/api.js'
import { toastError, toastSuccess } from '../../styles/toastConfig.js'

// Componentes da Aplicação
import { DataTable } from '@/components/DataTable'
import { ConfirmModal } from '../../components/ConfirmModal'
import { InputMask } from '../../components/InputMask.jsx'
import { Layout } from '../../components/Layout'
import { PriceCell } from '../../components/PriceCell.jsx'
import { ProductSearchModal } from '../../components/ProductsSearchModal'

// Componentes shadcn/ui
import { Button } from '@/components/Button'
import { SelectCustom } from '@/components/SelectCustom.jsx'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function NewOffer() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()
  const { user } = useAuth()

  // Refs de controle de ciclo de vida e concorrência
  const searchInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(false)
  const preventRefetchOnAdd = useRef(false)
  const syncTimeoutRef = useRef({})

  // Estados de dados
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedProductIds, setselectedProductIds] = useState([])

  // Estados do formulário
  const [offerName, setOfferName] = useState('')
  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [campaignName, setCampaignName] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [userUnit, setUserUnit] = useState(null)

  // Modais e Loaders
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)
  const [isSavingOffer, setIsSavingOffer] = useState(false)

  // Status de Sincronismo no Backend
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      const unidadeProperty = user.unit || user.unidade || user.unid_codigo
      if (unidadeProperty) {
        setUserUnit(unidadeProperty)
      }
    }
  }, [user])

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await api.get('campaigns')
        setCampaigns(response.data)
      } catch (err) {
        console.error('Erro ao buscar campanhas:', err)
      }
    }
    fetchCampaign()
  }, [])

  const clearForm = useCallback((clearAll = true, confirmed = false) => {
    if (!confirmed) {
      setShowClearConfirmation(true)
      return
    }

    setselectedProductIds([])

    if (clearAll) {
      setOfferName('')
      setInitialDate('')
      setFinalDate('')
      setCampaignName('')
      setCampaignSelected('0')
    }

    setShowClearConfirmation(false)
  }, [])

  const handleConfirmClear = useCallback(async () => {
    try {
      if (userUnit) {
        await api.delete(`/offers/draft/all/${userUnit}`)
      }
      clearForm(true, true)
      setSelectedProducts([])
      toastSuccess('Rascunho e formulário limpos com sucesso')
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error)
      toastError('Erro ao limpar rascunho no servidor.')
    } finally {
      setShowClearConfirmation(false)
    }
  }, [clearForm, userUnit])

  const calculateProfit = useCallback((cost, price) => {
    const nCost = parseFloat(cost) || 0
    const nPrice = parseFloat(price) || 0
    if (nPrice <= 0) return '0.0'
    return (((nPrice - nCost) / nPrice) * 100).toFixed(1)
  }, [])

  const formatCurrency = useCallback(value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }, [])

  const formatSearchTerm = useCallback(term => {
    if (!term || term.length === 0) return ''
    return term.charAt(0).toUpperCase() + term.slice(1)
  }, [])

  // const fetchProducts = useCallback(
  //   async (term = '', page = 1) => {
  //     if (!isMountedRef.current || !isModalOpen) return

  //     if (abortControllerRef.current) {
  //       abortControllerRef.current.abort()
  //     }

  //     abortControllerRef.current = new AbortController()
  //     const signal = abortControllerRef.current.signal

  //     setIsLoading(true)

  //     try {
  //       let url
  //       if (term && term.length >= 3) {
  //         setIsSearching(true)
  //         const formattedTerm = formatSearchTerm(term)
  //         url = `/products?search=${encodeURIComponent(formattedTerm)}`
  //         if (userUnit) url += `&unit=${encodeURIComponent(userUnit)}`
  //       } else {
  //         setIsSearching(false)
  //         url = `/products/all?page=${page}&limit=20`
  //         if (userUnit) url += `&unit=${encodeURIComponent(userUnit)}`
  //       }

  //       url += '&sort=descricao&order=asc'

  //       const response = await apiERP.get(url, { signal, timeout: 8000 })
  //       if (signal.aborted) return

  //       if (term && term.length >= 3 && Array.isArray(response.data)) {
  //         const formattedProducts = response.data.map(product => ({
  //           id: product.codigo,
  //           prod_codigo: product.codigo,
  //           prod_cod_barras: product.codigobarras || 'N/A',
  //           prod_descricao: product.descricao,
  //           prod_complemento: product.complemento || '',
  //           prod_preco_custo: product.custoempresa || 0,
  //           prod_preco_venda: product.prvenda || 0,
  //           embalagem: product.embalagem,
  //           unidade: product.unidade
  //         }))

  //         setProducts(formattedProducts)

  //         if (
  //           formattedProducts.length === 0 &&
  //           term.trim() !== '' &&
  //           !isLoading
  //         ) {
  //           setTimeout(() => {
  //             if (
  //               term === debouncedSearchTerm &&
  //               formattedProducts.length === 0
  //             ) {
  //               toastError('Nenhum produto encontrado com este termo.')
  //             }
  //           }, 1000)
  //         }

  //         setTotalPages(1)
  //         setCurrentPage(1)
  //       } else if (response.data && response.data.products) {
  //         const formattedProducts = response.data.products.map(product => ({
  //           id: product.codigo,
  //           prod_codigo: product.codigo,
  //           prod_cod_barras: product.codigobarras || 'N/A',
  //           prod_descricao: product.descricao,
  //           prod_complemento: product.complemento || '',
  //           prod_preco_custo: product.custoempresa || 0,
  //           prod_preco_venda: product.prvenda || 0,
  //           embalagem: product.embalagem,
  //           unidade: product.unidade
  //         }))

  //         setProducts(formattedProducts)
  //         setTotalPages(response.data.pagination.totalPages)
  //         setCurrentPage(response.data.pagination.page)
  //       }
  //     } catch (error) {
  //       // Erros de busca tratados silenciosamente
  //     } finally {
  //       if (!signal.aborted && isMountedRef.current) {
  //         setIsLoading(false)
  //       }
  //     }
  //   },
  //   [userUnit, isModalOpen, formatSearchTerm, debouncedSearchTerm, isLoading]
  // )

  const fetchProducts = useCallback(
    async (term = '', page = 1) => {
      if (!isMountedRef.current || !isModalOpen) return

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsLoading(true)

      try {
        let url = ''
        const hasSearch = term && term.trim().length >= 3

        if (hasSearch) {
          setIsSearching(true)
          const formattedTerm = formatSearchTerm(term)
          url = `/products?search=${encodeURIComponent(formattedTerm)}`
          if (userUnit) url += `&unit=${encodeURIComponent(userUnit)}`
        } else {
          setIsSearching(false)
          url = `/products/all?page=${page}&limit=30`
          if (userUnit) url += `&unit=${encodeURIComponent(userUnit)}`
        }

        url += '&sort=descricao&order=asc'

        const response = await apiERP.get(url, { signal, timeout: 8000 })
        if (signal.aborted) return

        // ✅ NORMALIZAÇÃO BLINDADA: extrai a lista quer venha como Array direto ou { products: [...] }
        const rawList = Array.isArray(response.data)
          ? response.data
          : response.data?.products || []

        const formattedProducts = rawList.map(product => ({
          id: product.codigo || product.prod_codigo,
          prod_codigo: product.codigo || product.prod_codigo,
          prod_cod_barras:
            product.codigobarras || product.prod_codbarras || 'N/A',
          prod_descricao: product.descricao || product.prod_descricao,
          prod_complemento:
            product.complemento || product.prod_complemento || '',
          prod_preco_custo: product.custoempresa || product.prun_ctempresa || 0,
          prod_preco_venda: product.prvenda || product.prun_prvenda || 0,
          embalagem: product.embalagem || product.prod_emb || 'UN',
          unidade: product.unidade || product.prun_unid_codigo || ''
        }))

        setProducts(formattedProducts)

        if (hasSearch) {
          setTotalPages(1)
          setCurrentPage(1)
        } else if (response.data?.pagination) {
          setTotalPages(response.data.pagination.totalPages)
          setCurrentPage(response.data.pagination.page)
        }
      } catch (error) {
        // Se for cancelamento de digitação prévia, não limpa a tela
        if (error?.code !== 'ERR_CANCELED' && !signal.aborted) {
          setProducts([])
        }
      } finally {
        // ✅ Garante que o loading seja desativado caso o componente ainda esteja montado
        if (isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [userUnit, isModalOpen, formatSearchTerm]
  )

  useEffect(() => {
    if (isModalOpen) {
      if (preventRefetchOnAdd.current && debouncedSearchTerm === '') {
        preventRefetchOnAdd.current = false
        return
      }
      fetchProducts(debouncedSearchTerm)
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedSearchTerm, fetchProducts, isModalOpen])

  const openModal = useCallback(() => {
    setIsModalOpen(true)
    setselectedProductIds([])
    setSearchTerm('')
    setIsSearching(false)

    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
      fetchProducts('', 1)
    }, 100)
  }, [fetchProducts])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSearchTerm('')
    setProducts([])

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const syncItemToDatabase = useCallback(
    async product => {
      if (!userUnit || !user?.id) return

      setIsSyncing(true)

      try {
        const sanitizedPrice =
          typeof product.offerPrice === 'string'
            ? parseFloat(product.offerPrice.replace(',', '.'))
            : product.offerPrice

        await api.post('/offers/draft', {
          product_id: String(product.prod_codigo),
          description: product.prod_descricao,
          barcode: product.prod_cod_barras,
          unit: userUnit,
          cost_price: parseFloat(product.prod_preco_custo) || 0,
          sale_price: parseFloat(product.prod_preco_venda) || 0,
          offer_price: sanitizedPrice || 0,
          user_id: user.id
        })

        // Sincronia completada com sucesso: zera qualquer erro prévio
        setSyncError(false)
      } catch (error) {
        setSyncError(true)
        console.error('Erro na sincronia:', error)
      } finally {
        setIsSyncing(false)
      }
    },
    [userUnit, user]
  )

  const addSelectedProducts = useCallback(async () => {
    if (!selectedProductIds || selectedProductIds.length === 0) {
      toastError('Selecione pelo menos um produto')
      return
    }

    // Localiza todos os produtos marcados
    const productsToAdd = products.filter(p =>
      selectedProductIds.some(
        id => String(id) === String(p.id || p.prod_codigo)
      )
    )

    // Filtra os que já estão na lista
    const newProducts = productsToAdd.filter(
      product =>
        !selectedProducts.some(
          p =>
            String(p.id || p.prod_codigo) ===
            String(product.id || product.prod_codigo)
        )
    )

    if (newProducts.length === 0) {
      toastError('Os produtos selecionados já estão na lista')
      return
    }

    const formattedProducts = newProducts.map(product => ({
      ...product,
      offerPrice: '',
      profit: calculateProfit(product.prod_preco_custo, 0)
    }))

    try {
      // Sincroniza todos com o rascunho
      await Promise.all(formattedProducts.map(prod => syncItemToDatabase(prod)))

      setSelectedProducts(prev => [...prev, ...formattedProducts])
      toastSuccess(
        `${formattedProducts.length} produto(s) adicionado(s) ao rascunho!`
      )
      setselectedProductIds([])
      closeModal()
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      toastError('Falha de rede ao salvar rascunho.')
    }
  }, [
    selectedProductIds,
    products,
    selectedProducts,
    calculateProfit,
    syncItemToDatabase,
    closeModal
  ])

  // 1. Função removeProduct atualizada:
  const removeProduct = useCallback(
    async productId => {
      if (!productId) return

      try {
        // Exclui no servidor primeiro para garantir persistência
        await api.delete(`/offers/draft/${String(productId)}`, {
          params: { unit: userUnit }
        })

        // Remove do estado local somente após sucesso no banco
        setSelectedProducts(prev =>
          prev.filter(p => String(p.prod_codigo || p.id) !== String(productId))
        )

        toastSuccess('Produto removido do rascunho')
      } catch (error) {
        console.error('Erro ao deletar rascunho:', error)
        toastError('Erro ao sincronizar remoção com o servidor.')
      }
    },
    [userUnit]
  )

  const handleGeneratePDF = useCallback(async data => {
    const {
      products,
      unit,
      name,
      initialDate,
      finalDate,
      campaignId,
      campaignName
    } = data

    const produtosPDF = products.map(product => ({
      produto_id: product.prod_codigo || '',
      descricao: product.prod_descricao || '',
      custo: parseFloat(product.prod_preco_custo) || 0,
      preco_original: parseFloat(product.prod_preco_venda) || 0,
      preco_oferta:
        parseFloat(String(product.offerPrice).replace(',', '.')) || 0
    }))

    try {
      const pdfResponse = await api.post(
        '/offers/pdf',
        {
          produtos: produtosPDF,
          unidade: unit || '',
          name,
          initialDate,
          finalDate,
          campaign_id: campaignId || null,
          campaign_name: campaignName || null
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')

      if (!printWindow) {
        toastError('PDF gerado, mas o navegador bloqueou o pop-up.')
      }
      return true
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toastError('Erro ao gerar o PDF da oferta.')
      return false
    }
  }, [])

  const saveOffer = useCallback(async () => {
    if (!selectedProducts?.length)
      return toastError('Adicione pelo menos um produto')

    const produtosInvalidos = selectedProducts.filter(p => {
      const priceValue =
        typeof p.offerPrice === 'string'
          ? parseFloat(p.offerPrice.replace(',', '.'))
          : p.offerPrice
      return isNaN(priceValue) || priceValue <= 0
    })

    if (produtosInvalidos.length > 0) {
      return toastError('Defina preços válidos antes de salvar')
    }

    const finalOfferName = offerName?.trim() || campaignName?.trim()
    if (!finalOfferName) return toastError('Informe um nome ou campanha')

    if (!initialDate || !finalDate)
      return toastError('Informe as datas inicial e final')

    const formatDateForAPI = d => d.split('/').reverse().join('-')
    const formattedInitialDate = formatDateForAPI(initialDate)
    const formattedFinalDate = formatDateForAPI(finalDate)

    setIsSavingOffer(true)

    try {
      const productsFormatted = selectedProducts.map(product => ({
        product_id: product.prod_codigo || '',
        description: product.prod_descricao || '',
        cost: (parseFloat(product.prod_preco_custo) || 0).toString(),
        price: (parseFloat(product.prod_preco_venda) || 0).toString(),
        offer: parseFloat(
          String(product.offerPrice).replace(',', '.')
        ).toString(),
        profit: (parseFloat(product.profit) || 0).toString(),
        unit: product.unidade || userUnit || ''
      }))

      await api.post('/offers', {
        name: finalOfferName,
        initial_date: formattedInitialDate,
        final_date: formattedFinalDate,
        unit: userUnit,
        products: productsFormatted,
        campaign_id: campaignSelected === '0' ? null : campaignSelected,
        campaign_name: campaignName || null
      })

      await api.delete(`/offers/draft/all/${userUnit}`)

      await handleGeneratePDF({
        products: selectedProducts,
        unit: userUnit,
        name: finalOfferName,
        initialDate: formattedInitialDate,
        finalDate: formattedFinalDate,
        campaignId: campaignSelected === '0' ? null : campaignSelected,
        campaignName
      })

      toastSuccess('Oferta finalizada com sucesso!')
      setSelectedProducts([])
      clearForm(true, true)
    } catch (error) {
      console.error('Erro ao salvar oferta:', error)
      toastError(
        'Erro ao salvar oferta: ' + (error.message || 'Erro de comunicação')
      )
    } finally {
      setIsSavingOffer(false)
    }
  }, [
    selectedProducts,
    userUnit,
    offerName,
    campaignName,
    campaignSelected,
    initialDate,
    finalDate,
    handleGeneratePDF,
    clearForm
  ])

  function handleCampaignsChange(value) {
    setCampaignSelected(value)
    if (value && value !== '0') {
      const selected = campaigns.find(c => String(c.id) === String(value))
      setCampaignName(selected ? selected.name : '')
    } else {
      setCampaignName('')
    }
  }

  const handleRowUpdate = useCallback(
    (rowIndex, columnId, value) => {
      setSelectedProducts(prev => {
        const newData = [...prev]
        const item = { ...newData[rowIndex] }

        item[columnId] = value

        if (columnId === 'offerPrice') {
          const sanitized = String(value).replace(',', '.')
          const validNumber = parseFloat(sanitized) || 0

          item.profit = calculateProfit(item.prod_preco_custo, validNumber)

          const productId = item.prod_codigo
          if (syncTimeoutRef.current[productId]) {
            clearTimeout(syncTimeoutRef.current[productId])
          }

          syncTimeoutRef.current[productId] = setTimeout(async () => {
            try {
              await syncItemToDatabase(item)
            } catch (err) {
              console.error('Falha ao sincronizar preço:', err)
            }
          }, 1000)
        }

        newData[rowIndex] = item
        return newData
      })
    },
    [calculateProfit, syncItemToDatabase]
  )

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

  const tableColumns = useMemo(
    () => [
      { accessorKey: 'prod_codigo', header: 'Código' },
      { accessorKey: 'prod_descricao', header: 'Descrição' },
      { accessorKey: 'prod_complemento', header: 'Complemento' },
      {
        accessorKey: 'prod_preco_custo',
        header: 'Custo',
        cell: ({ getValue }) => formatCurrency(getValue())
      },
      {
        accessorKey: 'prod_preco_venda',
        header: 'Preço Venda',
        cell: ({ getValue }) => formatCurrency(getValue())
      },
      {
        accessorKey: 'offerPrice',
        header: 'Preço Oferta (R$)',
        cell: ({ row }) => (
          <PriceCell
            value={row.original.offerPrice}
            index={row.index}
            onUpdate={newValue =>
              handleRowUpdate(row.index, 'offerPrice', newValue)
            }
          />
        )
      },
      {
        accessorKey: 'profit',
        header: 'Margem (%)',
        cell: ({ row }) => {
          const custo = parseFloat(row.original.prod_preco_custo) || 0
          const preco =
            parseFloat(String(row.original.offerPrice).replace(',', '.')) || 0
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
            <div className="flex items-center gap-1.5 select-none">
              {/* Ponto indicador de status com glow sutil */}
              <span
                className={`h-2 w-2 rounded-full shadow-sm shrink-0 ${config.dotClass}`}
              />

              {/* Valor numérico com cor direta e sem container/card */}
              <span
                className={`font-bold text-sm tracking-tight ${config.colorClass}`}
              >
                {margemFormatada}%
              </span>

              {/* Ícone de tendência da margem */}
              <IconComponent
                className={`h-3.5 w-3.5 shrink-0 ${config.colorClass}`}
                strokeWidth={2.5}
              />
            </div>
          )
        }
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const productCode = row.original.prod_codigo || row.original.id

          return (
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
              onClick={() => removeProduct(productCode)}
              title="Remover produto da oferta"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )
        }
      }
    ],
    [formatCurrency, handleRowUpdate, removeProduct]
  )

  useEffect(() => {
    async function loadDraft() {
      if (!userUnit) return

      try {
        setIsLoading(true)
        const response = await api.get(`/offers/draft/${userUnit}`)

        const mappedProducts = response.data.map(item => ({
          id: item.product_id,
          prod_codigo: item.product_id,
          prod_descricao: item.description,
          prod_cod_barras: item.barcode,
          prod_preco_custo: item.cost_price,
          prod_preco_venda: item.sale_price,
          offerPrice:
            item.offer_price === 0
              ? ''
              : String(item.offer_price).replace('.', ','),
          profit: calculateProfit(item.cost_price, item.offer_price)
        }))

        setSelectedProducts(mappedProducts)
      } catch (error) {
        toastError('Não foi possível recuperar o rascunho anterior.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDraft()
  }, [userUnit, calculateProfit])

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-3">
        {/* Top Header Responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-4 sm:p-6 rounded-2xl shadow-none">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <h1 className="text-xl sm:text-xl font-bold tracking-tight text-green-600">
                Nova Oferta
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Crie ofertas, escolha os produtos e defina margens e sincronize em
              tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dock de Conexão / Nuvem */}
            <TooltipProvider delayDuration={200}>
              <div
                className={`flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition-all duration-200 shadow-2xs select-none ${
                  syncError
                    ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    : isSyncing
                      ? 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                      : 'border-border/60 bg-card/60 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {syncError ? (
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          <CloudAlert className="h-4 w-4 shrink-0 text-rose-600 animate-pulse" />
                          <span className="hidden sm:inline font-semibold">
                            Erro de sincronia
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        Falha ao salvar rascunho. Clique em reconectar.
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs font-semibold border-rose-500/30 bg-background text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:hover:bg-rose-950/40"
                      onClick={() => {
                        setSyncError(false)
                        selectedProducts.forEach(p => syncItemToDatabase(p))
                      }}
                    >
                      <RefreshCw className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Reconectar</span>
                    </Button>
                  </div>
                ) : isSyncing ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
                        <span className="hidden sm:inline text-sky-700 dark:text-sky-300 font-medium">
                          Salvando rascunho...
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Sincronizando alterações automaticamente
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <CloudCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline font-medium text-muted-foreground">
                          Rascunho salvo
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      Todas as alterações foram salvas
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>

            <Button
              type="button"
              color="orange"
              label="Produtos"
              onClick={openModal}
              icon={Barcode}
            />
          </div>
        </div>

        {/* Formulário Principal de Oferta */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
              {/* Seleção de Campanha */}
              <div className="lg:col-span-4 flex flex-col gap-1.5">
                <SelectCustom
                  id="campaign_select"
                  label="Campanha"
                  placeholder="Selecione a campanha"
                  value={String(campaignSelected)}
                  onValueChange={handleCampaignsChange}
                >
                  {campaigns.map(camp => (
                    <option key={camp.id} value={String(camp.id)}>
                      {camp.name}
                    </option>
                  ))}
                </SelectCustom>
              </div>

              {/* Data Inicial */}
              <div className="lg:col-span-3">
                <InputMask
                  id="initial_date"
                  name="initial_date"
                  label="Data Inicial"
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  value={initialDate}
                  onChange={e => setInitialDate(e.target.value)}
                  icon={CalendarDays}
                  showCalendar={true}
                  className="h-10"
                />
              </div>

              {/* Data Final */}
              <div className="lg:col-span-3">
                <InputMask
                  id="final_date"
                  name="final_date"
                  label="Data Final"
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  value={finalDate}
                  onChange={e => setFinalDate(e.target.value)}
                  icon={CalendarDays}
                  showCalendar={true}
                  className="h-10"
                />
              </div>

              {/* Ações: Salvar e Limpar */}
              <div className="lg:col-span-2 flex items-center gap-2">
                <Button
                  type="button"
                  onClick={saveOffer}
                  color="green"
                  icon={Tag}
                  label="Salvar"
                />

                <Button
                  type="button"
                  color="red"
                  icon={Trash2}
                  onClick={() => clearForm(true)}
                  title="Limpar formulário e rascunho"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos da Oferta / Empty State */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <CardContent className="p-4">
            {selectedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3">
                  <PackageOpen className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Nenhum produto em oferta
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1">
                  Abra a gaveta de produtos pelo botão no topo para selecionar
                  os itens que farão parte do cartaz.
                </p>
              </div>
            ) : (
              <DataTable
                data={selectedProducts}
                columns={tableColumns}
                showSelectColumn={false}
                enableRowSelection={false}
                onRowUpdate={handleRowUpdate}
                defaultPageSize={80}
              />
            )}
          </CardContent>
        </Card>

        {/* Modal: Confirmação de Limpeza */}
        <ConfirmModal
          isOpen={showClearConfirmation}
          onClose={() => setShowClearConfirmation(false)}
          onConfirm={handleConfirmClear}
          title="Confirmar Limpeza"
          icon={Trash2}
          variant="destructive"
          confirmButtonText="Sim, limpar rascunho"
          content={
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja limpar todo o formulário? Esta ação
              removerá os produtos adicionados da sessão e reiniciará as datas.
            </p>
          }
        />

        {/* Modal de Pesquisa no Catálogo ERP */}
        {isModalOpen && (
          <ProductSearchModal
            isOpen={isModalOpen}
            onClose={closeModal}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            products={products}
            isLoading={isLoading}
            selectedProductIds={selectedProductIds}
            onSelectProducts={setselectedProductIds}
            onConfirm={addSelectedProducts}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Modal: Processamento / Geração do Cartaz */}
        <ConfirmModal
          isOpen={isSavingOffer}
          title="Finalizando Oferta"
          variant="success"
          isLoading={true}
          icon={() => (
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          )}
          content={
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>
                Salvando os registros no banco de dados, limpando rascunhos e
                compilando o PDF.
              </p>
              <p className="font-semibold text-green-600">
                Por favor, aguarde...
              </p>
            </div>
          }
        />
      </div>
    </Layout>
  )
}
