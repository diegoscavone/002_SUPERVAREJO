import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ConfirmationModalBody,
  ConfirmationModalContainer,
  ConfirmationModalContent,
  ConfirmationModalFooter,
  ConfirmationModalHeader,
  ConfirmationModalTitle,
  Container,
  Content
} from './styles'

// Componentes originais mantidos
import { Button } from '@/components/ui/button'
import { Section } from '../../components/Section'

// Imports adicionais
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PiBarcode, PiCalendarDots, PiTrash } from 'react-icons/pi'
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
import { Barcode, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProductSearchModal } from '../../components/ProductsSearchModal'
import { useCreatedPoster } from '../../hooks/createdPoster'

// Constantes para configuração do cache
const CURRENT_OFFER_KEY = 'currentOffer'
const OFFER_NAME_KEY = 'offerName'
const SELECTED_PRODUCT_ID_KEY = 'selectedProductId'
const CAMPAIGN_NAME_KEY = 'campaignName'
const INITIAL_DATE_KEY = 'initialDate'
const FINAL_DATE_KEY = 'finalDate'

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

// Custom hook para localStorage - Simplificado para salvar apenas produtos da oferta
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = useCallback(
    value => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        // Erro silencioso, sem logs
      }
    },
    [key, storedValue]
  )

  // Função para limpar o valor específico
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      // Erro silencioso, sem logs
    }
  }, [key, initialValue])

  return [storedValue, setValue, clearValue]
}

const PriceCell = React.memo(({ getValue, row, column, table }) => {
  const initialValue = getValue()
  const [value, setValue] = useState(initialValue || '0,00') // Valor padrão inicial

  useEffect(() => {
    // Sincroniza apenas se o valor for diferente e consistente
    if (
      initialValue !== undefined &&
      initialValue !== value &&
      initialValue !== ''
    ) {
      setValue(initialValue)
    }
  }, [initialValue])

  const updateParent = val => {
    // REDE DE SEGURANÇA: Se o valor for vazio ou apenas espaços, envia 0,00
    const finalValue = val.trim() === '' ? '0,00' : val

    // Se o valor foi corrigido para 0,00, atualiza o estado local também
    if (val.trim() === '') setValue('0,00')

    console.log(
      `[PriceCell Row ${row.index}] Tentando atualizar pai com:`,
      finalValue
    )
    table.options.meta?.updateData(row.index, column.id, finalValue)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Valida o valor atual antes de pular de linha
      const valToSave = value.trim() === '' ? '0,00' : value
      if (value.trim() === '') setValue('0,00')

      updateParent(valToSave)

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
      onChange={e => {
        setValue(e.target.value)
        // Opcional: atualização em tempo real para a margem
        // Se quiser que a margem mude para 0% enquanto apaga, envie o valor vazio
        updateParent(e.target.value)
      }}
      // Quando o usuário sai do campo, o 0,00 é forçado
      onBlur={() => updateParent(value)}
      onKeyDown={handleKeyDown}
      onFocus={e => e.target.select()}
    />
  )
})

export function NewOffer() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()
  const [generatingPosters, setGeneratingPosters] = useState(false)
  // Refs para otimização
  const searchInputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const isMountedRef = useRef(false)
  const preventRefetchOnAdd = useRef(false)

  // Estados para gerenciar produtos
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [products, setProducts] = useState([])

  const [selectedProducts, setSelectedProducts] = useState(() => {
    // Tenta carregar do localStorage apenas UMA VEZ na montagem
    const saved = localStorage.getItem(CURRENT_OFFER_KEY)
    return saved ? JSON.parse(saved) : []
  })

  const [selectedProductId, setSelectedProductId, clearSelectedProductId] =
    useLocalStorage(SELECTED_PRODUCT_ID_KEY, null)

  const [offerName, setOfferName, clearOfferName] = useLocalStorage(
    OFFER_NAME_KEY,
    ''
  )

  const [initialDate, setInitialDate, clearInitialDate] = useLocalStorage(
    INITIAL_DATE_KEY,
    ''
  )

  const [finalDate, setFinalDate, clearFinalDate] = useLocalStorage(
    FINAL_DATE_KEY,
    ''
  )

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
  const [campaignName, setCampaignName, clearCampaignName] = useLocalStorage(
    CAMPAIGN_NAME_KEY,
    ''
  )
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(CURRENT_OFFER_KEY, JSON.stringify(selectedProducts))
      console.log('[Backup] Lista salva no LocalStorage')
    }, 1000) // Salva no disco apenas após 1 segundo sem digitação

    return () => clearTimeout(handler)
  }, [selectedProducts])

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
        // Se não foi confirmado, apenas mostra o modal
        setShowClearConfirmation(true)
        return
      }

      // Se foi confirmado, executa a limpeza
      // clearSelectedProducts()
      clearSelectedProductId()

      if (clearAll) {
        clearOfferName()
        clearInitialDate()
        clearFinalDate()
        clearCampaignName()
        setCampaignSelected('0')
      } else {
        toastSuccess('Lista de produtos limpa')
      }

      setShowClearConfirmation(false)
    },
    [
      // clearSelectedProducts,
      clearSelectedProductId,
      clearOfferName,
      clearInitialDate,
      clearFinalDate,
      clearCampaignName,
      setCampaignSelected
    ]
  )

  const handleConfirmClear = useCallback(() => {
    clearForm(true, true) // Executa a limpeza com confirmação
    toastSuccess('Formulário limpo com sucesso')
  }, [clearForm])

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

  const addSelectedProduct = useCallback(() => {
    if (!selectedProductId) {
      toastError('Selecione um produto')
      return
    }

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

      const productToAdd = {
        ...product,
        offerPrice: '0,00',
        profit: calculateProfit(product.prod_preco_custo, 0)
      }

      setSelectedProducts(prev => [...prev, productToAdd])
      toastSuccess('Produto adicionado!')

      // --- AQUI ESTÁ A CHAVE ---
      setSelectedProductId(null) // Limpa o estado no pai
      // -------------------------

      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }
  }, [
    selectedProductId,
    products,
    selectedProducts,
    setSelectedProducts,
    setSelectedProductId
  ])

  const removeProduct = useCallback(
    productId => {
      setSelectedProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      )
      toastSuccess('Produto removido da lista')
    },
    [setSelectedProducts]
  )

  const saveOffer = useCallback(async () => {
    // Validações dos produtos
    if (
      !selectedProducts ||
      !Array.isArray(selectedProducts) ||
      selectedProducts.length === 0
    ) {
      toastError('Adicione pelo menos um produto para salvar a oferta')
      return
    }

    // Verificar se os preços de oferta são válidos
    const produtosInvalidos = selectedProducts.filter(p => {
      // Converte "2,99" para "2.99" e remove caracteres não numéricos exceto o ponto
      const priceValue =
        typeof p.offerPrice === 'string'
          ? parseFloat(p.offerPrice.replace(',', '.'))
          : p.offerPrice

      return isNaN(priceValue) || priceValue <= 0
    })

    if (produtosInvalidos.length > 0) {
      toastError(
        'Defina preços válidos (maiores que R$ 0,00) para todos os produtos antes de salvar'
      )
      return
    }

    // Validar nome da oferta - usar o nome da campanha se offerName estiver vazio
    const finalOfferName =
      offerName && offerName.trim()
        ? offerName.trim()
        : campaignName && campaignName.trim()
          ? campaignName.trim()
          : ''

    if (!finalOfferName) {
      toastError('Digite um nome para a oferta ou selecione uma campanha')
      return
    }

    // Validar datas
    if (!initialDate || !finalDate) {
      toastError('Informe as datas inicial e final da oferta')
      return
    }

    // Atualizar o nome da oferta no localStorage se estiver usando o nome da campanha
    if (!offerName && campaignName) {
      setOfferName(campaignName)
    }

    // Validar formato das datas (DD/MM/YYYY para YYYY-MM-DD)
    const formatDateForAPI = dateString => {
      if (
        !dateString ||
        typeof dateString !== 'string' ||
        !dateString.includes('/')
      ) {
        return null
      }
      const parts = dateString.split('/')
      if (parts.length !== 3) {
        return null
      }
      const [day, month, year] = parts
      return `${year}-${month}-${day}`
    }

    const formattedInitialDate = formatDateForAPI(initialDate)
    const formattedFinalDate = formatDateForAPI(finalDate)

    if (!formattedInitialDate || !formattedFinalDate) {
      toastError('Formato de data inválido. Use DD/MM/AAAA')
      return
    }

    // Validar que a data final é posterior à inicial
    const initialDateObj = new Date(formattedInitialDate)
    const finalDateObj = new Date(formattedFinalDate)

    if (initialDateObj > finalDateObj) {
      toastError('A data final deve ser posterior à data inicial')
      return
    }

    try {
      // Garantir que temos um array válido
      if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
        throw new Error('Lista de produtos inválida')
      }

      // 1. Preparar os dados para salvar a oferta - com verificação adicional de segurança
      const productsFormatted = []

      // Processar cada produto individualmente para evitar erros em lote
      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i]

        // Verificação detalhada para depuração
        if (!product || typeof product !== 'object') {
          console.error(`Produto ${i} inválido:`, product)
          continue // Pula este produto em vez de falhar completamente
        }

        productsFormatted.push({
          product_id: product.prod_codigo || '',
          description: product.prod_descricao || '',
          cost: (parseFloat(product.prod_preco_custo) || 0).toString(),
          price: (parseFloat(product.prod_preco_venda) || 0).toString(),
          offer: (parseFloat(product.offerPrice) || 0).toString(),
          profit: (parseFloat(product.profit) || 0).toString(),
          unit: product.unidade || userUnit || ''
        })
      }

      // Verificar se temos produtos após filtragem
      if (productsFormatted.length === 0) {
        throw new Error('Nenhum produto válido para salvar')
      }

      // 2. Enviar requisição para criar a oferta e seus produtos
      const response = await api.post('/offers', {
        name: finalOfferName,
        initial_date: formattedInitialDate,
        final_date: formattedFinalDate,
        unit: userUnit,
        products: productsFormatted,
        campaign_id: campaignSelected || null,
        campaign_name: campaignName || null
      })

      // Capturar o ID da oferta criada
      const offerId = response.data.offer_id

      // 3. Agora gerar o PDF usando o controlador específico de PDF
      // Formatar os produtos para o formato esperado pelo gerador de PDF
      const produtosPDF = []

      // Novamente, verificação produto a produto
      for (const product of selectedProducts) {
        if (product && typeof product === 'object') {
          produtosPDF.push({
            produto_id: product.prod_codigo || '',
            descricao: product.prod_descricao || '',
            custo: parseFloat(product.prod_preco_custo) || 0,
            preco_original: parseFloat(product.prod_preco_venda) || 0,
            preco_oferta: parseFloat(product.offerPrice) || 0
          })
        }
      }

      // Verificar novamente se temos produtos válidos para o PDF
      if (produtosPDF.length === 0) {
        throw new Error('Nenhum produto válido para gerar o PDF')
      }

      // Requisição separada para o gerador de PDF
      const pdfResponse = await api.post(
        '/offers/pdf',
        {
          produtos: produtosPDF,
          unidade: userUnit || '',
          name: finalOfferName,
          initialDate: formattedInitialDate,
          finalDate: formattedFinalDate,
          campaign_id: campaignSelected || null,
          campaign_name: campaignName || null
        },
        {
          responseType: 'blob' // Importante para receber dados binários
        }
      )

      // 4. Processar o PDF recebido
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // 5. Abrir o PDF em uma nova janela
      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        printWindow.document.title = `Oferta: ${finalOfferName}`
        printWindow.onload = function () {
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
          }, 1000)
        }

        // Armazenar os dados relevantes para geração de cartazes
        setSavedOfferData({
          products: selectedProducts,
          initialDate: initialDate,
          finalDate: finalDate,
          campaignId: campaignSelected,
          campaignName: campaignName,
          offerName: finalOfferName
        })

        toastSuccess('Oferta salva com sucesso e PDF gerado!')
        setShowPostersConfirmation(true) // Mostrar o modal de confirmação
        clearForm(true, true)
      } else {
        // Armazenar os dados relevantes para geração de cartazes
        setSavedOfferData({
          products: selectedProducts,
          initialDate: initialDate,
          finalDate: finalDate,
          campaignId: campaignSelected,
          campaignName: campaignName,
          offerName: finalOfferName
        })

        toastSuccess('Oferta salva com sucesso!')
        setShowPostersConfirmation(true) // Mostrar o modal de confirmação
        clearForm(true, true)

        toastError(
          'Não foi possível abrir o PDF. Verifique se o bloqueador de pop-ups está desativado.'
        )
      }
    } catch (error) {
      console.error('Erro ao salvar oferta:', error)
      toastError(
        'Erro ao salvar a oferta: ' + (error.message || 'Erro desconhecido')
      )
    }
  }, [
    selectedProducts,
    userUnit,
    api,
    offerName,
    campaignName,
    campaignSelected,
    initialDate,
    finalDate,
    setOfferName,
    clearForm,
    toastError,
    toastSuccess
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

  // Use o padrão de atualização funcional para evitar dependência de selectedProducts
  // const updateOfferPrice = useCallback((productId, newPrice) => {
  //   setSelectedProducts(prev => {
  //     // 1. Achar o produto
  //     const index = prev.findIndex(p => p.id === productId);
  //     if (index === -1 || prev[index].offerPrice === newPrice) return prev;

  //     // 2. Criar nova lista
  //     const updatedList = [...prev];
  //     const item = { ...updatedList[index] };

  //     // 3. Calcular margem
  //     const sanitized = String(newPrice).replace(',', '.').replace(/[^\d.]/g, '');
  //     const validNumber = parseFloat(sanitized) || 0;

  //     item.offerPrice = newPrice;
  //     item.profit = calculateProfit(item.prod_preco_custo, validNumber);

  //     updatedList[index] = item;
  //     return updatedList;
  //   });
  // }, [calculateProfit]); // APENAS calculateProfit como dependência

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
            <PiTrash size={18} />
          </Button>
        )
      }
    ],
    [formatCurrency] // REMOVIDO selectedProducts e updateOfferPrice daqui
  )

  const handleRowUpdate = useCallback(
    (rowIndex, columnId, value) => {
      // LOG DE SEGURANÇA
      if (value === undefined) {
        console.error('[BUG] Tentativa de atualizar com valor undefined!')
        return
      }

      setSelectedProducts(prev => {
        // 1. Criamos uma cópia profunda da lista para não mutar o estado anterior
        const newData = Array.from(prev)

        if (!newData[rowIndex]) return prev

        // 2. Criamos uma cópia do item específico
        const item = { ...newData[rowIndex] }

        // 3. Só atualizamos se o valor for realmente diferente
        if (item[columnId] === value) return prev

        item[columnId] = value

        // 4. Recalcula a margem se for o preço
        if (columnId === 'offerPrice') {
          const sanitized = String(value)
            .replace(',', '.')
            .replace(/[^\d.]/g, '')
          const validNumber = parseFloat(sanitized) || 0
          const cost = parseFloat(item.prod_preco_custo) || 0
          item.profit = calculateProfit(cost, validNumber)
        }

        newData[rowIndex] = item
        return newData
      })
    },
    [calculateProfit]
  )

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
            <Button
              onClick={openModal}
              className="bg-orange-500 hover:bg-orange-600 transition-colors duration-300 text-white gap-2 shadow-none"
            >
              <Barcode /> Produtos
            </Button>
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
                    icon={PiCalendarDots}
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
                    icon={PiCalendarDots}
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
                    <PiTrash size={18} /> Limpar
                  </Button>
                </Field>
              </div>

              {/* Ações do Formulário */}

              {/* Tabela de Produtos Selecionados */}
              <div className="bg-white rounded-xl overflow-hidden">
                {selectedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
                    <PiBarcode size={48} className="opacity-20" />
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
          <ConfirmationModalContainer>
            <ConfirmationModalContent>
              <ConfirmationModalHeader>
                <ConfirmationModalTitle>
                  Confirmar Limpeza
                </ConfirmationModalTitle>
              </ConfirmationModalHeader>
              <ConfirmationModalBody>
                <p>
                  Tem certeza que deseja limpar todo o formulário? Esta ação irá
                  remover todos os produtos selecionados e limpar todos os
                  campos.
                </p>
              </ConfirmationModalBody>
              <ConfirmationModalFooter>
                <Button
                  title="Cancelar"
                  color="GRAY"
                  onClick={handleCancelClear}
                />
                <Button
                  title="Sim, Limpar Tudo"
                  icon={PiTrash}
                  color="RED"
                  onClick={handleConfirmClear}
                />
              </ConfirmationModalFooter>
            </ConfirmationModalContent>
          </ConfirmationModalContainer>
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
      </Container>
    </Layout>
  )
}
