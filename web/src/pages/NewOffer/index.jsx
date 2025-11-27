import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActionButton,
  ActionButtons,
  Card,
  CardBody,
  CardHeader,
  CloseButton,
  ConfirmationModalBody,
  ConfirmationModalContainer,
  ConfirmationModalContent,
  ConfirmationModalFooter,
  ConfirmationModalHeader,
  ConfirmationModalTitle,
  Container,
  Content,
  Form,
  InputWrapper,
  Label,
  Modal,
  ModalBody,
  ModalContainer,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  OfferPriceInput,
  PageButton,
  Pagination,
  ProductCounter,
  ProfitIndicator,
  SearchContainer,
  SearchInput,
  Table,
  TableCell,
  TableCheckbox,
  TableHeader,
  TableRow,
  MobileLabel
} from './styles'

// Componentes originais mantidos
import { Button } from '../../components/Button'
import { Footer } from '../../components/Footer'
import { Header } from '../../components/Header'
import { Nav } from '../../components/Nav'
import { Section } from '../../components/Section'

// Imports adicionais
import { PiBarcode, PiCalendarDots, PiTrash } from 'react-icons/pi'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { InputMask } from '../../components/InputMask/index.jsx'
import { Select } from '../../components/Select/index.jsx'
import { useAuth } from '../../hooks/auth'
import { api, apiERP } from '../../services/api.js'
import { toastError, toastSuccess } from '../../styles/toastConfig.js'

import { PiPlayCircle } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'
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

  const [selectedProducts, setSelectedProducts, clearSelectedProducts] =
    useLocalStorage(CURRENT_OFFER_KEY, [])

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
  const [isMobile, setIsMobile] = useState(false) // Estado para controlar se é mobile

  // Definir o componente como montado
  useEffect(() => {
    isMountedRef.current = true

    // Função para verificar o tamanho da tela
    const checkIsMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }

    // Executar na montagem e adicionar listener para resize
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      window.removeEventListener('resize', checkIsMobile) // Limpar listener
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

  const generatePosters = useCallback(async () => {
    // Validar se há produtos selecionados
    if (selectedProducts.length === 0) {
      toastError('Adicione produtos à lista')
      return
    }

    // Validar se existe uma campanha selecionada
    if (!campaignSelected || campaignSelected === '0') {
      toastError('Selecione uma campanha')
      return
    }

    // Validar preços de oferta
    const invalidProducts = selectedProducts.filter(
      p => isNaN(p.offerPrice) || p.offerPrice <= 0
    )

    if (invalidProducts.length > 0) {
      toastError('Defina preços válidos para todos os produtos')
      return
    }

    try {
      setGeneratingPosters(true)

      // Formato esperado das datas: DD/MM/YYYY
      const formatDateForPosters = dateString => {
        if (
          !dateString ||
          typeof dateString !== 'string' ||
          !dateString.includes('/')
        ) {
          return null
        }
        return dateString // Já está no formato correto DD/MM/YYYY para o hook
      }

      const formattedInitialDate = formatDateForPosters(initialDate)
      const formattedFinalDate = formatDateForPosters(finalDate)

      if (!formattedInitialDate || !formattedFinalDate) {
        toastError('Formato de data inválido')
        setGeneratingPosters(false)
        return
      }

      // Tipo de campanha padrão (1)
      const campaignTypeSelected = 1

      // Processar cada produto
      for (const product of selectedProducts) {
        const productInputs = {
          product_id: product.prod_codigo,
          description: product.prod_descricao,
          complement: product.prod_complemento || '',
          packaging: product.embalagem || '',
          price: product.offerPrice, // Usar o preço de oferta definido
          initial_date: formattedInitialDate,
          final_date: formattedFinalDate,
          campaignsSelected: campaignSelected,
          campaignTypeSelected: campaignTypeSelected,
          unit: product.unidade || userUnit,
          campaignName: campaignName
        }

        await handleCreatePoster(
          productInputs,
          formattedInitialDate,
          formattedFinalDate,
          campaignSelected,
          campaignTypeSelected
        )
      }

      toastSuccess('Cartazes criados com sucesso!')

      // Redirecionar para a página de impressão após 2 segundos
      setTimeout(() => {
        navigate('/print')
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar cartazes:', error)
      toastError(
        'Não foi possível criar os cartazes: ' +
          (error.message || 'Erro desconhecido')
      )
    } finally {
      setGeneratingPosters(false)
    }
  }, [
    selectedProducts,
    campaignSelected,
    campaignName,
    initialDate,
    finalDate,
    userUnit,
    handleCreatePoster,
    navigate,
    toastError,
    toastSuccess
  ])

  const clearForm = useCallback(
    (clearAll = true, confirmed = false) => {
      if (!confirmed) {
        // Se não foi confirmado, apenas mostra o modal
        setShowClearConfirmation(true)
        return
      }

      // Se foi confirmado, executa a limpeza
      clearSelectedProducts()
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
      clearSelectedProducts,
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

  const exportToPDF = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        // 1. Validação inicial dos dados
        if (selectedProducts.length === 0) {
          return reject(
            new Error('Adicione pelo menos um produto para exportar')
          )
        }

        // 2. Verificar se os preços de oferta são válidos
        const produtosInvalidos = selectedProducts.filter(
          p => isNaN(p.offerPrice) || p.offerPrice <= 0
        )

        if (produtosInvalidos.length > 0) {
          return reject(
            new Error(
              'Defina preços válidos para todos os produtos antes de exportar'
            )
          )
        }

        // 3. Criar o documento PDF
        console.log('Iniciando criação do PDF...')
        const doc = new jsPDF('l', 'mm', 'a4')

        // 4. Definir cores para a tabela
        const tableColors = {
          header: [22, 160, 33], // Verde para cabeçalho
          odd: [240, 255, 240], // Verde claro para linhas alternadas
          even: [255, 255, 255] // Branco para as outras linhas
        }

        // 5. Preparar dados de forma segura
        const headers = [
          ['RP', 'Código', 'Descrição', 'PMZ', 'Venda', 'R$', '%']
        ]

        const data = selectedProducts.map(product => {
          // Calcular a porcentagem de margem de lucro de forma segura
          const custo = parseFloat(product.prod_preco_custo) || 0
          const preco = parseFloat(product.offerPrice) || 0
          const margin =
            preco > 0 ? (((preco - custo) / preco) * 100).toFixed(2) : '0.00'

          return [
            product.prod_codigo || 'N/A',
            product.prod_cod_barras || 'N/A',
            product.prod_descricao || 'Sem descrição',
            custo.toFixed(2),
            (parseFloat(product.prod_preco_venda) || 0).toFixed(2),
            preco.toFixed(2),
            margin + '%'
          ]
        })

        console.log('Dados preparados para a tabela:', {
          headers,
          linhas: data.length
        })

        // 6. Gerar a tabela com try/catch específico
        try {
          console.log('Gerando tabela com autoTable...')
          doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
            theme: 'grid',
            headStyles: {
              fillColor: tableColors.header,
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center'
            },
            alternateRowStyles: {
              fillColor: tableColors.odd
            },
            styles: {
              overflow: 'linebreak',
              cellWidth: 'wrap',
              fontSize: 9,
              cellPadding: 3
            },
            columnStyles: {
              0: { cellWidth: 20 }, // RP
              1: { cellWidth: 35 }, // Código
              2: { cellWidth: 80 }, // Descrição
              3: { cellWidth: 20, halign: 'right' }, // PMZ
              4: { cellWidth: 20, halign: 'right' }, // Venda
              5: {
                cellWidth: 20,
                halign: 'right',
                fontStyle: 'bold',
                textColor: [255, 0, 0]
              }, // R$
              6: { cellWidth: 20, halign: 'right' } // %
            }
          })
          console.log('Tabela gerada com sucesso')
        } catch (tableError) {
          console.error('Erro na geração da tabela:', tableError)
          return reject(new Error(`Erro na tabela: ${tableError.message}`))
        }

        // 7. Adicionar rodapé
        try {
          console.log('Adicionando rodapé...')
          const validityDate = new Date()
          validityDate.setDate(validityDate.getDate() + 30) // Validade de 30 dias

          // Formatar data de validade
          const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
            .format(validityDate)
            .toUpperCase()
          const validityText = `VALIDADE ${validityDate.getDate()} DE ${month} DE ${validityDate.getFullYear()}`

          const finalY = doc.autoTable.previous.finalY + 10
          const pageWidth = doc.internal.pageSize.getWidth()

          doc.setTextColor(255, 0, 0)
          doc.setFontSize(10)
          doc.text(validityText, pageWidth / 2, finalY, { align: 'center' })
          console.log('Rodapé adicionado com sucesso')
        } catch (footerError) {
          console.error('Erro ao adicionar rodapé:', footerError)
          // Não rejeitar por erro no rodapé, apenas logar
        }

        // 8. Salvar o PDF com try/catch específico
        try {
          console.log('Salvando PDF...')
          doc.save('tabela-ofertas.pdf')
          console.log('PDF salvo com sucesso')
          resolve(true)
        } catch (saveError) {
          console.error('Erro ao salvar o PDF:', saveError)
          reject(new Error(`Erro ao salvar: ${saveError.message}`))
        }
      } catch (generalError) {
        console.error('Erro geral na geração do PDF:', generalError)
        reject(new Error(`Erro na geração: ${generalError.message}`))
      }
    })
  }, [selectedProducts])

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

  const handlePageChange = useCallback(
    newPage => {
      if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
        fetchProducts('', newPage)
      }
    },
    [currentPage, totalPages, fetchProducts]
  )

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

  const selectProduct = useCallback(
    productId => {
      // Se o produto já estiver selecionado, deseleciona
      if (selectedProductId === productId) {
        setSelectedProductId(null)
      } else {
        // Caso contrário, seleciona apenas este produto
        setSelectedProductId(productId)
      }
    },
    [selectedProductId, setSelectedProductId]
  )

  const addSelectedProduct = useCallback(() => {
    if (!selectedProductId) {
      toastError('Selecione um produto')
      return
    }

    // Encontrar o produto na lista atual
    const product = products.find(p => p.id === selectedProductId)

    if (!product) {
      toastError('Produto não encontrado')
      return
    }

    // Verificar se o produto já está na lista
    const productExists = selectedProducts.some(p => p.id === selectedProductId)

    if (productExists) {
      toastError('Este produto já está na lista')
      return
    }

    // Adicionar o produto com os dados de oferta - preço inicial definido como 0
    const productToAdd = {
      ...product,
      offerPrice: 0, // Inicializa com 0 conforme solicitado
      profit: calculateProfit(
        product.prod_preco_custo,
        0 // Cálculo inicial com preço 0
      )
    }

    setSelectedProducts(prevProducts => [...prevProducts, productToAdd])
    toastSuccess('Produto adicionado!')

    // Resetar seleção e fechar modal
    setSelectedProductId(null)

    preventRefetchOnAdd.current = true
    setSearchTerm('')
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
    // closeModal()
  }, [
    selectedProductId,
    products,
    selectedProducts,
    calculateProfit,
    setSelectedProducts,
    setSelectedProductId,
    closeModal
  ])

  const handleProductKeyDown = useCallback(
    (event, productId) => {
      if (event.key === ' ') {
        event.preventDefault()
        selectProduct(productId)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        addSelectedProduct()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        const nextRow = event.currentTarget.nextElementSibling
        if (nextRow) {
          nextRow.focus()
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        const prevRow = event.currentTarget.previousElementSibling
        if (prevRow) {
          prevRow.focus()
        }
      }
    },
    [selectProduct, addSelectedProduct]
  )

  const removeProduct = useCallback(
    productId => {
      setSelectedProducts(prevProducts =>
        prevProducts.filter(product => product.id !== productId)
      )
      toastSuccess('Produto removido da lista')
    },
    [setSelectedProducts]
  )

  const getProfitClass = useCallback(profit => {
    const profitNum = parseFloat(profit)
    if (profitNum < 15) return 'negative'
    if (profitNum < 30) return 'warning'
    return 'positive'
  }, [])

  const updateOfferPrice = useCallback(
    (productId, newPrice) => {
      setSelectedProducts(prevProducts =>
        prevProducts.map(product => {
          if (product.id === productId) {
            if (newPrice === '') {
              return {
                ...product,
                offerPrice: '',
                profit: calculateProfit(product.prod_preco_custo, 0)
              }
            }

            const offerPrice = parseFloat(newPrice)
            return {
              ...product,
              offerPrice,
              profit: calculateProfit(product.prod_preco_custo, offerPrice)
            }
          }
          return product
        })
      )
    },
    [calculateProfit, setSelectedProducts]
  )

  const handleGeneratePosters = useCallback(async () => {
    if (!savedOfferData) {
      toastError('Dados da oferta não disponíveis')
      return
    }

    setShowPostersConfirmation(false) // Fechar o modal

    try {
      setGeneratingPosters(true)

      const { products, initialDate, finalDate, campaignId, campaignName } =
        savedOfferData

      // Formato esperado das datas: DD/MM/YYYY
      const formatDateForPosters = dateString => {
        if (
          !dateString ||
          typeof dateString !== 'string' ||
          !dateString.includes('/')
        ) {
          return null
        }
        return dateString
      }

      const formattedInitialDate = formatDateForPosters(initialDate)
      const formattedFinalDate = formatDateForPosters(finalDate)

      if (!formattedInitialDate || !formattedFinalDate) {
        toastError('Formato de data inválido')
        return
      }

      // Validar se existe uma campanha selecionada
      if (!campaignId || campaignId === '0') {
        toastError('Selecione uma campanha para gerar os cartazes')
        return
      }

      // Tipo de campanha padrão (1)
      const campaignTypeSelected = 1

      // Processar cada produto
      for (const product of products) {
        const productInputs = {
          product_id: product.prod_codigo,
          description: product.prod_descricao,
          complement: product.prod_complemento || '',
          packaging: product.embalagem || '',
          price: product.offerPrice,
          initial_date: formattedInitialDate,
          final_date: formattedFinalDate,
          campaignsSelected: campaignId,
          campaignTypeSelected: campaignTypeSelected,
          unit: product.unidade || userUnit,
          campaignName: campaignName
        }

        await handleCreatePoster(
          productInputs,
          formattedInitialDate,
          formattedFinalDate,
          campaignId,
          campaignTypeSelected
        )
      }

      toastSuccess('Cartazes criados com sucesso!')

      // Redirecionar para a página de impressão após 2 segundos
      setTimeout(() => {
        clearForm(true) // Limpar o formulário
        navigate('/print')
      }, 2000)
    } catch (error) {
      console.error('Erro ao gerar cartazes:', error)
      toastError(
        'Não foi possível criar os cartazes: ' +
          (error.message || 'Erro desconhecido')
      )
    } finally {
      setGeneratingPosters(false)
    }
  }, [
    savedOfferData,
    userUnit,
    handleCreatePoster,
    navigate,
    clearForm,
    toastError,
    toastSuccess
  ])

  const handleCancelPosters = useCallback(() => {
    setShowPostersConfirmation(false)
    clearForm(true) // Limpar o formulário após fechar o modal
  }, [clearForm])

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
    const produtosInvalidos = selectedProducts.filter(
      p => isNaN(p.offerPrice) || p.offerPrice <= 0
    )

    if (produtosInvalidos.length > 0) {
      toastError('Defina preços válidos para todos os produtos antes de salvar')
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

  const paginationComponent = useMemo(() => {
    if (isSearching || products.length === 0 || totalPages <= 1) return null

    return (
      <Pagination>
        <PageButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          &lt;
        </PageButton>

        {totalPages <= 7 ? (
          // Se tiver poucas páginas, mostra todas
          [...Array(totalPages)].map((_, i) => (
            <PageButton
              key={i + 1}
              className={currentPage === i + 1 ? 'active' : ''}
              onClick={() => handlePageChange(i + 1)}
              disabled={isLoading}
            >
              {i + 1}
            </PageButton>
          ))
        ) : (
          // Se tiver muitas páginas, mostra apenas algumas
          <>
            {/* Primeiros 3 números */}
            {[...Array(Math.min(3, totalPages))].map((_, i) => (
              <PageButton
                key={i + 1}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => handlePageChange(i + 1)}
                disabled={isLoading}
              >
                {i + 1}
              </PageButton>
            ))}

            {/* Indicador de mais páginas */}
            {currentPage > 4 && currentPage < totalPages - 3 && (
              <PageButton className="dots" disabled>
                ...
              </PageButton>
            )}

            {/* Página atual se estiver no meio */}
            {currentPage > 3 && currentPage < totalPages - 2 && (
              <PageButton className="active" disabled={isLoading}>
                {currentPage}
              </PageButton>
            )}

            {/* Indicador de mais páginas */}
            {currentPage < totalPages - 3 && (
              <PageButton className="dots" disabled>
                ...
              </PageButton>
            )}

            {/* Últimos 3 números */}
            {totalPages > 3 &&
              [
                ...Array(
                  Math.min(
                    3,
                    totalPages - Math.max(0, currentPage - totalPages + 3)
                  )
                )
              ].map((_, i) => {
                const pageNum = totalPages - 2 + i
                return (
                  <PageButton
                    key={pageNum}
                    className={currentPage === pageNum ? 'active' : ''}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                  >
                    {pageNum}
                  </PageButton>
                )
              })}
          </>
        )}

        <PageButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          &gt;
        </PageButton>
      </Pagination>
    )
  }, [
    currentPage,
    totalPages,
    isLoading,
    handlePageChange,
    products.length,
    isSearching
  ])

  function handleCampaignsChange(event) {
    const campaignId = event.target.value
    setCampaignSelected(campaignId)

    // Encontrar o nome da campanha selecionada
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

  // Renderização principal
  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <div className="content-header">
          <Button
            title="Produtos"
            icon={PiBarcode}
            color="ORANGE"
            onClick={openModal}
          />
        </div>

        <Section title="Gestão de Ofertas">
          <Card>
            <CardHeader>
              <Form>
                <InputWrapper>
                  <Label>Campanha</Label>
                  <Select
                    onChange={handleCampaignsChange}
                    value={campaignSelected}
                  >
                    <option value="0">Selecione</option>
                    {campaigns.map(campaign => (
                      <option
                        key={campaign.id}
                        value={campaign.id}
                        data-image={campaign.image}
                      >
                        {campaign.name}
                      </option>
                    ))}
                  </Select>
                </InputWrapper>

                <InputWrapper>
                  <Label>Data Inicial</Label>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="00/00/0000"
                    type="text"
                    onChange={handleInitialDateChange}
                    name="initial_date"
                    icon={PiCalendarDots}
                    value={initialDate}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Data Final</Label>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="00/00/0000"
                    type="text"
                    onChange={handleFinalDateChange}
                    name="final_date"
                    icon={PiCalendarDots}
                    value={finalDate}
                  />
                </InputWrapper>

                <ActionButtons>
                  <Button
                    title="Limpar"
                    icon={PiTrash}
                    color="RED"
                    onClick={() => clearForm(true)}
                  />
                  <Button title="Salvar" color="GREEN" onClick={saveOffer} />
                </ActionButtons>
              </Form>
            </CardHeader>
            <CardBody>
              {selectedProducts.length === 0 ? (
                <div className="empty-state">
                  Nenhum produto selecionado para oferta. Clique em "Produtos"
                  para começar.
                </div>
              ) : (
                <>
                  {/* Contador de produtos */}
                  <ProductCounter>
                    <span>
                      {selectedProducts.length} produto
                      {selectedProducts.length !== 1 ? 's' : ''} adicionado
                      {selectedProducts.length !== 1 ? 's' : ''}
                    </span>
                  </ProductCounter>

                  <Table>
                    <thead>
                      <tr>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Descrição</TableHeader>
                        {!isMobile && <TableHeader>Custo (R$)</TableHeader>}
                        {!isMobile && <TableHeader>Preço Atual (R$)</TableHeader>}
                        <TableHeader className="column-price">
                          Preço Oferta (R$)
                        </TableHeader>
                        {!isMobile && (
                          <TableHeader className="column-profit">
                            Margem (%)
                          </TableHeader>
                        )}
                        <TableHeader></TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.prod_codigo}</TableCell>
                          <TableCell>{product.prod_descricao}</TableCell>
                          {!isMobile && (
                            <TableCell>
                              {formatCurrency(product.prod_preco_custo)}
                            </TableCell>
                          )}
                          {!isMobile && (
                            <TableCell>
                              {formatCurrency(product.prod_preco_venda)}
                            </TableCell>
                          )}
                          <TableCell>
                            <OfferPriceInput
                              type="number"
                              min="0"
                              step="0.01"
                              className="offer-price-input"
                              value={product.offerPrice}
                              onChange={e =>
                                updateOfferPrice(product.id, e.target.value)
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
                              onClick={() => removeProduct(product.id)}
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

      {showClearConfirmation && (
        <ConfirmationModalContainer>
          <ConfirmationModalContent>
            <ConfirmationModalHeader>
              <ConfirmationModalTitle>Confirmar Limpeza</ConfirmationModalTitle>
            </ConfirmationModalHeader>
            <ConfirmationModalBody>
              <p>
                Tem certeza que deseja limpar todo o formulário? Esta ação irá
                remover todos os produtos selecionados e limpar todos os campos.
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
        <ModalContainer
          onClick={e => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <Modal>
            <ModalHeader>
              <ModalTitle>Pesquisar Produtos</ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              <SearchContainer>
                <SearchInput
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar por código, descrição ou código de barras..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader></TableHeader>
                    <TableHeader>Código</TableHeader>
                    {!isMobile && <TableHeader>Código de Barras</TableHeader>}
                    <TableHeader>Descrição</TableHeader>
                    {!isMobile && <TableHeader>Complemento</TableHeader>}
                    {!isMobile && <TableHeader>Custo (R$)</TableHeader>}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? '3' : '6'} className="empty-result">
                        Nenhum produto encontrado. Tente outro termo de busca.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map(product => (
                      <TableRow
                        key={product.id}
                        className={
                          selectedProductId === product.id ? 'selected-row' : ''
                        }
                        tabIndex={0}
                        onClick={() => selectProduct(product.id)}
                        onKeyDown={e => handleProductKeyDown(e, product.id)}
                      >
                        <TableCell>
                          <TableCheckbox>
                            <input
                              type="radio"
                              checked={selectedProductId === product.id}
                              onChange={() => selectProduct(product.id)}
                            />
                            <span className="radio-custom"></span>
                          </TableCheckbox>
                        </TableCell>
                        <TableCell>{product.prod_codigo}</TableCell>
                        {!isMobile && (
                          <TableCell>{product.prod_cod_barras}</TableCell>
                        )}
                        <TableCell>{product.prod_descricao}</TableCell>
                        {!isMobile && (
                          <TableCell>{product.prod_complemento}</TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>
                            {formatCurrency(product.prod_preco_custo)}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Componente de paginação - só aparece quando não está em busca */}
              {paginationComponent}
            </ModalBody>
            <ModalFooter>
              <div className="selection-info">
                <span>
                  {selectedProductId
                    ? '1 item selecionado'
                    : 'Nenhum item selecionado'}
                </span>
              </div>
              <Button
                title="Adicionar Produto"
                onClick={addSelectedProduct}
                color="GREEN"
                disabled={!selectedProductId}
              />
            </ModalFooter>
          </Modal>
        </ModalContainer>
      )}
      <Footer />
      {/* {showPostersConfirmation && (
        <ConfirmationModalContainer>
          <ConfirmationModalContent>
            <ConfirmationModalHeader>
              <ConfirmationModalTitle>Gerar Cartazes</ConfirmationModalTitle>
            </ConfirmationModalHeader>
            <ConfirmationModalBody>
              <p>
                A oferta foi salva com sucesso.
              </p>
            </ConfirmationModalBody>
            <ConfirmationModalFooter>
              <Button title="Não" color="GRAY" onClick={handleCancelPosters} />
              <Button
                title={generatingPosters ? 'Gerando...' : 'Sim, Gerar Cartazes'}
                icon={PiPlayCircle}
                color="ORANGE"
                onClick={handleGeneratePosters}
                disabled={generatingPosters}
              />
            </ConfirmationModalFooter>
          </ConfirmationModalContent>
        </ConfirmationModalContainer>
      )} */}
    </Container>
  )
}
