import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ConfirmationModalContainer,
  ConfirmationModalContent,
  Container,
  Content
} from './styles'

import { Button } from '@/components/ui/button'
import { Section } from '../../components/Section'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { InputMask } from '../../components/InputMask/index.jsx'
import { Layout } from '../../components/Layout/index'
import { useAuth } from '../../hooks/auth'
import { api, apiERP } from '../../services/api.js'
import { toastError, toastSuccess } from '../../styles/toastConfig.js'

import { DataTable } from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Barcode,
  BarcodeIcon,
  CalendarDays,
  CloudAlert,
  CloudCheck,
  CloudUpload,
  Loader2,
  Tag,
  Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../../components/ConfirmModal'
import { ProductSearchModal } from '../../components/ProductsSearchModal'
import { useCreatedPoster } from '../../hooks/createdPoster'

// Custom hook para debounce de pesquisa
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

const PriceCell = React.memo(({ getValue, row, column, table }) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue === '0,00' ? '' : initialValue)

 useEffect(() => {
    if (initialValue !== undefined && initialValue !== value) {
      setValue(initialValue === '0,00' ? '' : initialValue)
    }
  }, [initialValue])

 const updateParent = val => {
    const finalValue = val.trim() === '' ? '0,00' : val
    table.options.meta?.updateData(row.index, column.id, finalValue)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      updateParent(value)

      const allInputs = Array.from(
        document.querySelectorAll('input.offer-price-input')
      )
      const currentIndex = allInputs.indexOf(e.currentTarget)

      if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
        setTimeout(() => {
          allInputs[currentIndex + 1].focus()
          allInputs[currentIndex + 1].select()
        }, 10)
      }
    }
  }

  return (
    <Input
      type="text"
      className="w-24 h-8 text-center font-bold border-green-200 focus:ring-green-600 offer-price-input"
      value={value}
      placeholder="0,00"
      onChange={e => {
        setValue(e.target.value)
        updateParent(e.target.value)
      }}
      onBlur={() => updateParent(value)}
      onKeyDown={handleKeyDown}
      onFocus={e => {
        e.target.select();
        table.options.meta?.setActiveRowIndex?.(row.index);
      }}
    />
  )
})

export function NewOffer() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()

  // Refs para otimização
  const searchInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(false)
  const preventRefetchOnAdd = useRef(false)
  const syncTimeoutRef = useRef({})

  // Estados para gerenciar produtos
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [products, setProducts] = useState([])

  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [offerName, setOfferName] = useState('')
  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [campaignName, setCampaignName] = useState('')

  // Estados do modal de busca
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [userUnit, setUserUnit] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [showPostersConfirmation, setShowPostersConfirmation] = useState(false)
  const [savedOfferData, setSavedOfferData] = useState(null)

  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  // Estados para controle de sincronia e carregamento
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(false)
  const [isSavingOffer, setIsSavingOffer] = useState(false) // Modal de salvamento global

  const { user } = useAuth()

  // Definir o componente como montado
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Obter a unidade do usuário logado
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
      const response = await api.get('campaigns')
      setCampaigns(response.data)
    }
    fetchCampaign()
  }, [])

  const clearForm = useCallback(
    (clearAll = true, confirmed = false) => {
      if (!confirmed) {
        setShowClearConfirmation(true)
        return
      }

      // Usamos diretamente as funções de 'set' do useState
      setSelectedProductId(null)

      if (clearAll) {
        setOfferName('')
        setInitialDate('')
        setFinalDate('')
        setCampaignName('')
        setCampaignSelected('0')
      }

      // Fecha o modal de confirmação após a limpeza
      setShowClearConfirmation(false)
    },
    [
      // Aqui incluímos apenas as funções de set que o componente usa
      setSelectedProductId,
      setOfferName,
      setInitialDate,
      setFinalDate,
      setCampaignName,
      setCampaignSelected
    ]
  )

  const handleConfirmClear = useCallback(async () => {
    try {
      // 1. Limpa o rascunho no Banco de Dados (API)
      if (userUnit) {
        await api.delete(`/offers/draft/all/${userUnit}`)
      }

      // 2. Limpa o estado local no Front-end
      clearForm(true, true) // Executa a limpeza dos campos e produtos
      setSelectedProducts([]) // Garante que a lista de produtos fique vazia

      toastSuccess('Rascunho e formulário limpos com sucesso')
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error)
      toastError('Erro ao limpar rascunho no servidor. Verifique sua conexão.')
    } finally {
      setShowClearConfirmation(false)
    }
  }, [clearForm, userUnit])

  const handleCancelClear = useCallback(() => {
    setShowClearConfirmation(false)
  }, [])

  const handleInitialDateChange = useCallback(
    e => {
      setInitialDate(e.target.value)
    },
    [setInitialDate]
  )

  const handleFinalDateChange = useCallback(
    e => {
      setFinalDate(e.target.value)
    },
    [setFinalDate]
  )

  const calculateProfit = useCallback((cost, price) => {
    const nCost = parseFloat(cost) || 0
    const nPrice = parseFloat(price) || 0
    if (nPrice <= 0) return 0
    return (((nPrice - nCost) / nPrice) * 100).toFixed(1)
  }, [])

  const formatCurrency = useCallback(value => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }, [])

  const formatSearchTerm = useCallback(term => {
    if (!term || term.length === 0) return ''
    return term.charAt(0).toUpperCase() + term.slice(1)
  }, [])

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
        let url
        // Verifica se está pesquisando ou listando todos
        if (term && term.length >= 3) {
          setIsSearching(true)
          const formattedTerm = formatSearchTerm(term)
          url = `/products?search=${encodeURIComponent(formattedTerm)}`
          if (userUnit) {
            url += `&unit=${encodeURIComponent(userUnit)}`
          }
        } else {
          setIsSearching(false)
          url = `/products/all?page=${page}&limit=20`
          if (userUnit) {
            url += `&unit=${encodeURIComponent(userUnit)}`
          }
        }

        // Adicionar ordenação por descrição
        url += '&sort=descricao&order=asc'

        const response = await apiERP.get(url, {
          signal,
          timeout: 8000
        })

        if (signal.aborted) return

        // Processar resultados da pesquisa
        if (
          term &&
          term.length >= 3 &&
          response.data &&
          Array.isArray(response.data)
        ) {
          const formattedProducts = response.data.map(product => ({
            id: product.codigo,
            prod_codigo: product.codigo,
            prod_cod_barras: product.codigobarras || 'N/A',
            prod_descricao: product.descricao,
            prod_complemento: product.complemento || '',
            prod_preco_custo: product.custoempresa || 0,
            prod_preco_venda: product.prvenda || 0,
            embalagem: product.embalagem,
            unidade: product.unidade
          }))

          setProducts(formattedProducts)

          // Mostrar mensagem apenas se for uma busca deliberada (sem caracteres digitados recentemente)
          // e nenhum produto for encontrado
          if (
            formattedProducts.length === 0 &&
            term.trim() !== '' &&
            !isLoading
          ) {
            // Verificar se é o mesmo termo depois de um tempo para evitar mensagens durante digitação
            setTimeout(() => {
              if (
                term === debouncedSearchTerm &&
                formattedProducts.length === 0
              ) {
                toastError('Nenhum produto encontrado com este termo.')
              }
            }, 1000)
          }

          // Simplificado: sem paginação complexa para resultados de pesquisa
          setTotalPages(1)
          setCurrentPage(1)
        }
        // Processar resultados da listagem
        else if (response.data && response.data.products) {
          const formattedProducts = response.data.products.map(product => ({
            id: product.codigo,
            prod_codigo: product.codigo,
            prod_cod_barras: product.codigobarras || 'N/A',
            prod_descricao: product.descricao,
            prod_complemento: product.complemento || '',
            prod_preco_custo: product.custoempresa || 0,
            prod_preco_venda: product.prvenda || 0,
            embalagem: product.embalagem,
            unidade: product.unidade
          }))

          setProducts(formattedProducts)

          // Manter paginação apenas para listagem completa
          setTotalPages(response.data.pagination.totalPages)
          setCurrentPage(response.data.pagination.page)
        }
      } catch (error) {
        // Remover completamente as mensagens de erro durante a busca
        // Os erros de servidor serão tratados silenciosamente
        // As mensagens "nenhum produto encontrado" já são exibidas no caso de sucesso com array vazio
      } finally {
        if (!signal.aborted && isMountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [userUnit, isModalOpen, formatSearchTerm, debouncedSearchTerm]
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
    setSelectedProductId(null)
    setSearchTerm('')
    setIsSearching(false)

    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
      fetchProducts('', 1)
    }, 100)
  }, [fetchProducts, setSelectedProductId])

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
      setSyncError(false)

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

        setIsSyncing(false)
      } catch (error) {
        setIsSyncing(false)
        setSyncError(true)
        console.error('Erro na sincronia:', error)
      }
    },
    [userUnit, user]
  )

  const addSelectedProduct = useCallback(async () => {
    if (!selectedProductId) {
      toastError('Selecione um produto')
      return
    }

    // Busca o produto no array de resultados da pesquisa do modal
    const product = products.find(
      p => String(p.id) === String(selectedProductId)
    )

    if (product) {
      const productExists = selectedProducts.some(
        p => String(p.id) === String(selectedProductId)
      )

      if (productExists) {
        toastError('Este produto já está na lista')
        return
      }

      // Preparamos o objeto com valores padrão
      const productToAdd = {
        ...product,
        offerPrice: '',
        profit: calculateProfit(product.prod_preco_custo, 0)
      }

      try {
        // Sincronização IMEDIATA com o banco de rascunhos
        await syncItemToDatabase(productToAdd)

        // Só atualizamos o estado local após o sucesso na API
        setSelectedProducts(prev => [...prev, productToAdd])
        toastSuccess('Produto adicionado ao rascunho!')

        // Limpa a seleção para o próximo bip/busca
        setSelectedProductId(null)

        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      } catch (error) {
        console.error('Erro ao salvar rascunho:', error)
        toastError(
          'Falha de rede: Não foi possível adicionar o produto ao rascunho.'
        )
      }
    }
  }, [
    selectedProductId,
    products,
    selectedProducts,
    calculateProfit,
    syncItemToDatabase,
    setSelectedProductId
  ])

  const removeProduct = useCallback(
    async productId => {
      try {
        // Remove visualmente primeiro (UX mais rápida)
        setSelectedProducts(prev => prev.filter(p => p.id !== productId))

        // Remove do banco (passando unit para o controller saber de qual loja é)
        await api.delete(`/offers/draft/${productId}?unit=${userUnit}`)

        toastSuccess('Produto removido do rascunho')
      } catch (error) {
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

    // Formatação específica para o PDF
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
          name: name,
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
        toastError(
          'PDF gerado, mas o bloqueador de pop-ups impediu a abertura.'
        )
      }

      return true
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toastError('Erro ao gerar o PDF da oferta.')
      return false
    }
  }, [])

  const saveOffer = useCallback(async () => {
    // --- VALIDAÇÕES (Mantidas) ---
    if (!selectedProducts?.length)
      return toastError('Adicione pelo menos um produto')

    const produtosInvalidos = selectedProducts.filter(p => {
      const priceValue =
        typeof p.offerPrice === 'string'
          ? parseFloat(p.offerPrice.replace(',', '.'))
          : p.offerPrice
      return isNaN(priceValue) || priceValue <= 0
    })

    if (produtosInvalidos.length > 0)
      return toastError('Defina preços válidos antes de salvar')

    const finalOfferName = offerName?.trim() || campaignName?.trim()
    if (!finalOfferName) return toastError('Informe um nome ou campanha')

    if (!initialDate || !finalDate) return toastError('Informe as datas')

    const formatDateForAPI = d => d.split('/').reverse().join('-')
    const formattedInitialDate = formatDateForAPI(initialDate)
    const formattedFinalDate = formatDateForAPI(finalDate)

    // --- EXECUÇÃO ---
    setIsSavingOffer(true)

    try {
      // 1. Formatar dados para a API principal
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

      // 2. Enviar para o banco
      await api.post('/offers', {
        name: finalOfferName,
        initial_date: formattedInitialDate,
        final_date: formattedFinalDate,
        unit: userUnit,
        products: productsFormatted,
        campaign_id: campaignSelected || null,
        campaign_name: campaignName || null
      })

      // 3. Limpeza Atômica (Importante: limpa rascunho antes de abrir o PDF)
      await api.delete(`/offers/draft/all/${userUnit}`)

      // 4. Gerar PDF usando a nova função
      await handleGeneratePDF({
        products: selectedProducts,
        unit: userUnit,
        name: finalOfferName,
        initialDate: formattedInitialDate,
        finalDate: formattedFinalDate,
        campaignId: campaignSelected,
        campaignName: campaignName
      })

      // 5. Reset do Estado Local
      toastSuccess('Oferta finalizada com sucesso!')
      setSelectedProducts([])
      setShowPostersConfirmation(true)
      clearForm(true, true)
    } catch (error) {
      console.error('Erro ao salvar oferta:', error)
      toastError(
        'Erro ao salvar a oferta: ' + (error.message || 'Erro desconhecido')
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

  const handleKeyDown = useCallback((event, index) => {
    // Verificar se a tecla pressionada é Enter
    if (event.key === 'Enter') {
      event.preventDefault() // Impedir o comportamento padrão do Enter

      // Encontrar todos os inputs de preço de oferta
      const inputs = document.querySelectorAll(
        'input[type="number"].offer-price-input'
      )

      // Verificar se encontramos algum input
      if (inputs.length === 0) {
        console.warn('Nenhum input encontrado com a classe offer-price-input')
        return
      }

      // Se houver um próximo input, dar foco a ele e selecionar seu conteúdo
      if (index < inputs.length - 1) {
        const nextInput = inputs[index + 1]
        nextInput.focus()
        nextInput.select() // Seleciona todo o texto do input
      } else if (inputs.length > 0) {
        // Se for o último input, voltar para o primeiro e selecionar seu conteúdo
        const firstInput = inputs[0]
        firstInput.focus()
        firstInput.select() // Seleciona todo o texto do input
      }
    }
  }, [])

  function handleCampaignsChange(value) {
    const campaignId = value // Agora 'value' já é o ID diretamente
    setCampaignSelected(campaignId)

    if (campaignId && campaignId !== '0') {
      const selectedCampaign = campaigns.find(
        c => c.id.toString() === campaignId.toString()
      )
      if (selectedCampaign) {
        setCampaignName(selectedCampaign.name)
      } else {
        setCampaignName('')
      }
    } else {
      setCampaignName('')
    }
  }

  const MARGIN_THEME = {
    CRITICAL: {
      min: -Infinity,
      max: 14.9,
      colorClass:
        'bg-red-600 hover:bg-red-600 text-white border-none shadow-none',
      variant: 'destructive'
    },
    WARNING: {
      min: 15,
      max: 25,
      colorClass:
        'bg-yellow-500 hover:bg-yellow-500 text-white border-none shadow-none',
      variant: 'outline'
    },
    SUCCESS: {
      min: 25.1,
      max: Infinity,
      colorClass:
        'bg-green-600 hover:bg-green-600 text-white border-none shadow-none',
      variant: 'success'
    }
  }

  const tableColumns = useMemo(
    () => [
      { accessorKey: 'prod_codigo', header: 'Código' },
      { accessorKey: 'prod_descricao', header: 'Descrição' },
      { accessorKey: 'prod_complemento', header: 'Complemento' },
      {
        accessorKey: 'prod_preco_custo',
        header: 'Custo (R$)',
        cell: ({ getValue }) => formatCurrency(getValue())
      },
      {
        accessorKey: 'prod_preco_venda',
        header: 'Preço Venda (R$)',
        cell: ({ getValue }) => formatCurrency(getValue())
      },
      {
        accessorKey: 'offerPrice',
        header: 'Preço Oferta (R$)',
        cell: PriceCell
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

          // Lógica Dinâmica de Cores
          let config = MARGIN_THEME.SUCCESS // Default

          if (margemNum <= MARGIN_THEME.CRITICAL.max) {
            config = MARGIN_THEME.CRITICAL
          } else if (margemNum <= MARGIN_THEME.WARNING.max) {
            config = MARGIN_THEME.WARNING
          }

          return (
            <Badge
              variant={config.variant}
              className={`font-bold rounded-md px-2 py-0.5 transition-colors ${config.colorClass}`}
            >
              {margemFormatada}%
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
            className="text-red-500 h-8 w-8"
            onClick={() => removeProduct(row.original.id)}
          >
            <Trash2 size={18} />
          </Button>
        )
      }
    ],
    [formatCurrency] // REMOVIDO selectedProducts e updateOfferPrice daqui
  )

  const handleRowUpdate = useCallback(
    (rowIndex, columnId, value) => {
      setSelectedProducts(prev => {
        const newData = [...prev]
        const item = { ...newData[rowIndex] }

        if (item[columnId] === value) return prev // Evita renders inúteis

        item[columnId] = value

        if (columnId === 'offerPrice') {
          const sanitized = String(value)
            .replace(',', '.')
            .replace(/[^\d.]/g, '')
          const validNumber = parseFloat(sanitized) || 0
          item.profit = calculateProfit(item.prod_preco_custo, validNumber)

          // Lógica de Debounce
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
          }, 800)
        }

        newData[rowIndex] = item
        return newData
      })
    },
    [calculateProfit, syncItemToDatabase]
  )

  useEffect(() => {
    async function loadDraft() {
      if (!userUnit) return

      try {
        setIsLoading(true)
        const response = await api.get(`/offers/draft/${userUnit}`)

        // Mapeia de volta para o formato que sua DataTable espera
        const mappedProducts = response.data.map(item => ({
          id: item.product_id, // Usamos o código como ID
          prod_codigo: item.product_id,
          prod_descricao: item.description,
          prod_cod_barras: item.barcode,
          prod_preco_custo: item.cost_price,
          prod_preco_venda: item.sale_price,
          offerPrice: item.offer_price === 0 ? '' : String(item.offer_price).replace('.', ','),
          profit: calculateProfit(item.cost_price, item.offer_price)
        }))

        setSelectedProducts(mappedProducts)
      } catch (error) {
        toastError('Não foi possível recuperar o rascunho da rede.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDraft()
  }, [userUnit, calculateProfit])

  // Renderização principal
  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content className="flex flex-col gap-6 p-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-none">
            <h1 className="text-base font-bold text-neutral-600">
              Gestão de Ofertas
            </h1>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md border bg-white shadow-sm">
                {syncError ? (
                  <div className="flex items-center gap-2 text-red-600 animate-pulse">
                    <span className="text-xs font-medium uppercase tracking-tighter italic">
                      Erro de Conexão
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        // Força a sincronização de todos os itens atuais
                        setSyncError(false)
                        selectedProducts.forEach(p => syncItemToDatabase(p))
                      }}
                    >
                      <CloudAlert />
                    </Button>
                  </div>
                ) : isSyncing ? (
                  <div className="flex items-center gap-2 text-blue-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                      Sincronizando...
                    </span>
                    <CloudUpload size={20} className="animate-bounce" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      Salvo na nuvem
                    </span>
                    <CloudCheck size={20} />
                  </div>
                )}
              </div>
              <Button
                onClick={openModal}
                className="bg-orange-500 hover:bg-orange-600 transition-colors duration-300 text-white gap-2 shadow-none"
              >
                <Barcode /> Produtos
              </Button>
            </div>
          </div>

          <Section>
            <div className="flex flex-col gap-6">
              {/* Formulário de Configuração - Padrão Shadcn */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white  rounded-xl">
                {/* Campo 1: Campanha */}
                <Field className="md:col-span-1 flex flex-col gap-2">
                  <FieldLabel>Campanha</FieldLabel>
                  <Select
                    onValueChange={handleCampaignsChange}
                    value={String(campaignSelected)}
                  >
                    <SelectTrigger className="shadow-none w-full">
                      <SelectValue placeholder="Selecione uma campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Selecione</SelectItem>
                      {campaigns.map(campaign => (
                        <SelectItem
                          key={campaign.id}
                          value={String(campaign.id)}
                          className="focus:bg-green-100 focus:text-green-600 transition-colors"
                        >
                          {campaign.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {/* Campo 2: Data Inicial */}
                <Field className="md:col-span-1 flex flex-col gap-2">
                  <FieldLabel>Data Inicial</FieldLabel>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="00/00/0000"
                    onChange={handleInitialDateChange}
                    name="initial_date"
                    icon={CalendarDays}
                    value={initialDate}
                  />
                </Field>

                {/* Campo 3: Data Final */}
                <Field className="md:col-span-1 flex flex-col gap-2">
                  <FieldLabel>Data Final</FieldLabel>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="00/00/0000"
                    onChange={handleFinalDateChange}
                    name="final_date"
                    icon={CalendarDays}
                    value={finalDate}
                  />
                </Field>

                {/* Botão 2: Salvar */}
                <Field className="md:col-span-1 flex flex-row gap-2">
                  <Button
                    onClick={saveOffer}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-4 w-fit md:w-fit"
                  >
                    <Tag /> Salvar Oferta
                  </Button>
                  {/* Botão 1: Limpar */}
                  <Button
                    variant="outline"
                    onClick={() => clearForm(true)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-500 border-red-200 h-10 px-4 w-fit md:w-fit"
                  >
                    <Trash2 size={18} /> Limpar
                  </Button>
                </Field>
              </div>

              {/* Ações do Formulário */}

              {/* Tabela de Produtos Selecionados */}
              <div className="bg-white rounded-xl overflow-hidden">
                {selectedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
                    <BarcodeIcon size={48} className="opacity-20" />
                    <p className="text-sm">
                      Nenhum produto selecionado para oferta.
                    </p>
                    <p className="text-xs">
                      Clique em "Produtos" no topo para começar.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={selectedProducts}
                    showSelectColumn={false}
                    enableRowSelection={false}
                    columns={tableColumns}
                    onRowUpdate={handleRowUpdate}
                    defaultPageSize={80}
                  />
                )}
              </div>
            </div>
          </Section>
        </Content>

        {showClearConfirmation && (
          <ConfirmModal
            isOpen={showClearConfirmation}
            onClose={handleCancelClear}
            onConfirm={handleConfirmClear}
            title="Confirmar Limpeza"
            content="Tem certeza que deseja limpar todo o formulário? Esta ação irá remover todos os produtos e resetar os campos."
            icon={Trash2}
            variant="destructive"
            confirmButtonText={
              <div className="flex items-center gap-2">
                <Trash2 size={18} />
                <span>Sim, Limpar Tudo</span>
              </div>
            }
          />
        )}

        {/* Modal de pesquisa de produtos (renderização condicional) */}
        {isModalOpen && (
          <ProductSearchModal
            isOpen={isModalOpen}
            onClose={closeModal}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            products={products}
            isLoading={isLoading}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
            onConfirm={addSelectedProduct}
            formatCurrency={formatCurrency}
          />
        )}

        {isSavingOffer && (
          <ConfirmModal
            isOpen={isSavingOffer}
            title="Processando Oferta"
            content={
              <div className="flex flex-col gap-2">
                <p>
                  Estamos salvando no banco de dados, limpando rascunhos e
                  gerando seu PDF.
                </p>
                <p className="font-medium text-green-600">
                  Por favor, aguarde um instante...
                </p>
              </div>
            }
            icon={() => (
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            )}
            variant="success"
            isLoading={true}
          />
        )}
      </Container>
    </Layout>
  )
}
