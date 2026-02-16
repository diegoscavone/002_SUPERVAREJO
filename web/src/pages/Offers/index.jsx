import {
  Container,
  Content,
  ButtonWrapper,
  InputWrapper,
  Label,
  Form,
  ButtonSearch,
  Message,
  SelectWrapper,
  Badge, // Importe o componente Badge
  TableSection
} from './styles.js'

import { PiFunnel, PiPlus, PiSealPercent, PiTrash } from 'react-icons/pi'

import { Header } from '../../components/Header'
import { Nav } from '../../components/Nav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import { api } from '../../services/api'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { Select } from '../../components/Select'
import { Input } from '../../components/Input'
import { InputMask } from '../../components/InputMask'
import { PostersTable } from '../../components/PostersTable'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import {
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  parse
} from 'date-fns'

export function Offers() {
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [selectedOffers, setSelectedOffers] = useState({})
  const [loading, setLoading] = useState(false)
  const [filteredOffers, setFilteredOffers] = useState([])

  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [nameFilter, setNameFilter] = useState('')

  // Função que retorna o badge com a cor apropriada para cada status
  function getStatusBadge(status) {
    let statusText = 'Desconhecido'
    let statusClass = 'unknown'

    switch (status) {
      case 'active':
        statusText = 'Ativa'
        statusClass = 'active'
        break
      case 'upcoming':
        statusText = 'Futura'
        statusClass = 'upcoming'
        break
      case 'expired':
        statusText = 'Encerrada'
        statusClass = 'expired'
        break
      default:
        statusText = 'Desconhecido'
        statusClass = 'unknown'
    }

    return <Badge className={statusClass}>{statusText}</Badge>
  }

  const offerColumns = [
    { accessorKey: 'id', header: 'ID', enableSorting: true },
    { accessorKey: 'name', header: 'Nome da Oferta', enableSorting: true },
    {
      accessorKey: 'initial_date',
      header: 'Data Inicial',
      cell: ({ getValue }) => formatDate(getValue()),
      enableSorting: true
    },
    {
      accessorKey: 'final_date',
      header: 'Data Final',
      cell: ({ getValue }) => formatDate(getValue()),
      enableSorting: true
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue()),
      enableSorting: true
    }
  ]

  // Mantive esta função para compatibilidade, mas ela não está sendo usada agora
  function getStatusLabel(status) {
    switch (status) {
      case 'active':
        return 'Ativa'
      case 'upcoming':
        return 'Futura'
      case 'expired':
        return 'Encerrada'
      default:
        return 'Desconhecido'
    }
  }

  function applyFilters() {
    let filtered = offers

    // Parse dates to compare
    const parsedInitialDate = initialDate
      ? parse(initialDate, 'dd/MM/yyyy', new Date())
      : null
    const parsedFinalDate = finalDate
      ? parse(finalDate, 'dd/MM/yyyy', new Date())
      : null

    if (parsedInitialDate) {
      filtered = filtered.filter(offer => {
        const offerDate = parseISO(offer.initial_date)
        return isAfter(offerDate, startOfDay(parsedInitialDate))
      })
    }

    if (parsedFinalDate) {
      filtered = filtered.filter(offer => {
        const offerDate = parseISO(offer.final_date)
        return isBefore(offerDate, endOfDay(parsedFinalDate))
      })
    }

    if (nameFilter) {
      filtered = filtered.filter(offer =>
        offer.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    setFilteredOffers(filtered)
  }

  //Verifica qual checkbox está selecionado
  function handleCheckboxSelected(rowSelection) {
    setSelectedOffers(rowSelection)
  }

  // async function fetchOffers() {
  //   try {
  //     setLoading(true)
  //     const response = await api.get('/offers')

  //     // Processar os dados para adicionar o status e contagem de produtos
  //     const processedOffers = response.data.map(offer => {
  //       // Determinar o status da oferta com base na data atual
  //       const today = new Date()
  //       const initialDate = new Date(offer.initial_date)
  //       const finalDate = new Date(offer.final_date)

  //       let status = 'unknown'
  //       if (today < initialDate) {
  //         status = 'upcoming'
  //       } else if (today > finalDate) {
  //         status = 'expired'
  //       } else {
  //         status = 'active'
  //       }

  //       return {
  //         ...offer,
  //         status,
  //         products_count: offer.products ? offer.products.length : 0
  //       }
  //     })

  //     setOffers(processedOffers)
  //     setFilteredOffers(processedOffers)
  //   } catch (error) {
  //     console.error('Erro ao buscar ofertas:', error)
  //     toastError('Não foi possível carregar as ofertas.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  async function fetchOffers() {
    try {
      setLoading(true)
      const response = await api.get('/offers')

      // Processar os dados para adicionar o status e contagem de produtos
      const processedOffers = response.data.map(offer => {
        // Determinar o status da oferta com base na data atual
        const today = new Date()
        const initialDate = new Date(offer.initial_date)

        // Definir a data final para o final do dia (23:59:59)
        const finalDate = new Date(offer.final_date)
        finalDate.setHours(23, 59, 59, 999)

        let status = 'unknown'
        if (today < initialDate) {
          status = 'upcoming'
        } else if (today > finalDate) {
          status = 'expired'
        } else {
          status = 'active'
        }

        return {
          ...offer,
          status,
          products_count: offer.products ? offer.products.length : 0
        }
      })

      // Ordenar as ofertas: primeiro por status (ativas primeiro) e depois por data inicial
      const sortedOffers = processedOffers.sort((a, b) => {
        // Definir prioridade para cada status
        const statusPriority = {
          active: 1, // Maior prioridade para ativas
          upcoming: 2, // Segunda prioridade para futuras
          expired: 3, // Menor prioridade para encerradas
          unknown: 4 // Prioridade mais baixa para desconhecidas
        }

        // Primeiro, comparar por status
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status]
        }

        // Se tiverem o mesmo status, ordenar por data
        // Para ofertas ativas, ordenar por data final (as que vencem primeiro aparecem antes)
        if (a.status === 'active') {
          return new Date(a.final_date) - new Date(b.final_date)
        }

        // Para ofertas futuras, ordenar por data inicial (as que começam primeiro aparecem antes)
        if (a.status === 'upcoming') {
          return new Date(a.initial_date) - new Date(b.initial_date)
        }

        // Para ofertas encerradas, ordenar por data final decrescente (as que encerraram mais recentemente aparecem antes)
        if (a.status === 'expired') {
          return new Date(b.final_date) - new Date(a.final_date)
        }

        // Fallback: ordenar por ID
        return a.id - b.id
      })

      setOffers(sortedOffers)
      setFilteredOffers(sortedOffers)
    } catch (error) {
      console.error('Erro ao buscar ofertas:', error)
      toastError('Não foi possível carregar as ofertas.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return 'Data inválida'
    }
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  async function deleteOffers() {
    const selectedIds = Object.keys(selectedOffers).filter(
      id => selectedOffers[id]
    )

    if (selectedIds.length === 0) {
      toastInfo('Selecione pelo menos uma oferta.')
      return
    }

    try {
      setLoading(true)
      const selectedOfferIds = selectedIds.map(id => Number(id))

      await api.delete(`/offers/${selectedOfferIds.join(',')}`)
      toastSuccess('Oferta(s) excluída(s) com sucesso!')
      await fetchOffers()
    } catch (error) {
      toastError('Erro ao excluir as ofertas.')
    } finally {
      setLoading(false)
      // Limpar a seleção após a exclusão
      setSelectedOffers({})
    }
  }

  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <div className="content-header">
          <Button
            title="Nova Oferta"
            icon={PiSealPercent}
            color="ORANGE"
            onClick={() => navigate('/offers/new')}
          />
        </div>
        <TableSection title="Gestão de Ofertas">
          {filteredOffers.length > 0 ? (
            <PostersTable
              data={filteredOffers}
              columns={offerColumns}
              selectedPosters={selectedOffers}
              onRowSelect={handleCheckboxSelected}
              showEditColumn={false}
              showSelectColumn={true}
            />
          ) : (
            <Message>
              <p>Nenhuma oferta encontrada para os filtros selecionados.</p>
            </Message>
          )}
        </TableSection>

        <Section>
          <ButtonWrapper>
            <Button
              title="Excluir"
              icon={PiTrash}
              color="RED"
              onClick={deleteOffers}
              disabled={loading}
            />
          </ButtonWrapper>
        </Section>
      </Content>

      <Footer />
    </Container>
  )
}
