import { Badge, Container, Content } from './styles.js'

import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Layout } from '../../components/Layout'
import { DataTable } from '../../components/DataTable'
import { api } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import {
  endOfDay,
  isAfter,
  isBefore,
  parse,
  parseISO,
  startOfDay
} from 'date-fns'
import { Search, Tag, Trash2 } from 'lucide-react'
import { ConfirmModal } from '../../components/ConfirmModal'

export function Offers() {
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [selectedOffers, setSelectedOffers] = useState({})
  const [loading, setLoading] = useState(false)
  const [filteredOffers, setFilteredOffers] = useState([])

  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [nameFilter, setNameFilter] = useState('')

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Nome da Oferta' },
    {
      accessorKey: 'initial_date',
      header: 'Data Inicial',
      cell: ({ getValue }) => formatDate(getValue())
    },
    {
      accessorKey: 'final_date',
      header: 'Data Final',
      cell: ({ getValue }) => formatDate(getValue())
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue()
        const statusMap = {
          active: { label: 'Ativa', variant: 'success' }, // Verifique se criou a variant no Shadcn
          upcoming: { label: 'Futura', variant: 'outline' },
          expired: { label: 'Encerrada', variant: 'destructive' }
        }
        const config = statusMap[status] || {
          label: 'Desconhecido',
          variant: 'secondary'
        }

        return (
          <Badge variant={config.variant} className="capitalize">
            {config.label}
          </Badge>
        )
      }
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

      const processedOffers = response.data.map(offer => {
        const today = new Date()
        const initialDate = new Date(offer.initial_date)
        const finalDate = new Date(offer.final_date)
        finalDate.setHours(23, 59, 59, 999)

        let status = 'active'
        if (today < initialDate) status = 'upcoming'
        else if (today > finalDate) status = 'expired'

        return {
          ...offer,
          status,
          products_count: offer.products ? offer.products.length : 0
        }
      })

      // Ordenação (Ativas -> Futuras -> Encerradas)
      const sortedOffers = processedOffers.sort((a, b) => {
        const priority = { active: 1, upcoming: 2, expired: 3, unknown: 4 }
        if (priority[a.status] !== priority[b.status]) {
          return priority[a.status] - priority[b.status]
        }
        return new Date(a.initial_date) - new Date(b.initial_date)
      })

      setOffers(sortedOffers)
      setFilteredOffers(sortedOffers)
    } catch (error) {
      toastError('Não foi possível carregar as ofertas.')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? '---' : date.toLocaleDateString('pt-BR')
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  async function deleteOffers() {
    // Agora o selectedOffers vêm no formato do TanStack: { "id1": true, "id2": true }
    const selectedIds = Object.keys(selectedOffers).filter(
      id => selectedOffers[id]
    )

    if (selectedIds.length === 0) {
      return toastInfo('Selecione pelo menos uma oferta para excluir.')
    }

    try {
      setLoading(true)
      await api.delete(`/offers/${selectedIds.join(',')}`)
      toastSuccess('Oferta(s) excluída(s) com sucesso!')
      await fetchOffers()
      setSelectedOffers({})
    } catch (error) {
      toastError('Erro ao excluir as ofertas.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmDelete() {
    const selectedIds = Object.keys(selectedOffers).filter(
      id => selectedOffers[id]
    )

    try {
      setIsDeleting(true)

      // Deleta as ofertas uma a uma (padrão seguro para REST)
      await Promise.all(selectedIds.map(id => api.delete(`/offers/${id}`)))

      toastSuccess(`${selectedIds.length} oferta(s) excluída(s) com sucesso!`)

      // Limpa a seleção e fecha o modal
      setSelectedOffers({})
      setIsDeleteModalOpen(false)

      // Recarrega a lista
      await fetchOffers()
    } catch (error) {
      console.error(error)
      toastError('Erro ao excluir as ofertas selecionadas.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content className="flex flex-col gap-6 p-6">
          {/* Cabeçalho de Ações */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-none">
            <h1 className="text-base font-bold text-neutral-500">
              Gestão de Ofertas
            </h1>
            <Button
              type="button"
              onClick={() => navigate('/offers/new')}
              className="bg-orange-500 hover:bg-orange-600 transition-colors duration-300 text-white gap-2 shadow-none"
            >
              <Tag size={18} /> Nova Oferta
            </Button>
          </div>

          {/* Seção da Tabela */}
          <Section>
            <div className="bg-white rounded-md">
              {filteredOffers.length > 0 ? (
                <DataTable
                  data={filteredOffers}
                  columns={offerColumns}
                  onRowSelect={setSelectedOffers} // Sincroniza seleção com {DataTable}
                  showSelectColumn={true}
                  showEditColumn={true} // Se quiser habilitar o lápis
                  handleEdit={id => navigate(`/offers/edit/${id}`)}
                />
              ) : (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl animate-in fade-in duration-500">
                {/* Círculo de fundo com ícone */}
                <div className="flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-sm mb-4">
                  <Search
                    className="w-10 h-10 text-slate-300"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Textos explicativos */}
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  Nenhuma oferta encontrada
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-[280px]">
                  Não foram encontrados nenhum <strong>produto</strong> em{' '}
                  <strong>oferta.</strong>
                </p>

                {/* Badge opcional para indicar status */}
                <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Search size={14} />
                  Clique no botão Nova Oferta
                </div>
              </div>
              )}
            </div>
          </Section>

          {/* Botão de Exclusão em Lote */}
          <Section>
            {Object.keys(selectedOffers).length > 0 && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={loading}
                  className="gap-2 shadow-none transition-all hover:bg-red-600 hover:brightness-110 active:scale-95"
                >
                  <Trash2 size={18} />
                  Excluir ({Object.keys(selectedOffers).length})
                </Button>
              </div>
            )}
          </Section>

          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            isLoading={isDeleting}
            variant="destructive"
            title="Confirmar Exclusão"
            icon={Trash2}
            confirmButtonText="Sim, excluir ofertas"
            content={
              <p>
                Você tem certeza que deseja excluir{' '}
                <strong>{Object.keys(selectedOffers).length}</strong> oferta(s)
                selecionada(s)? Esta ação removerá os históricos
                permanentemente.
              </p>
            }
          />
        </Content>
      </Container>
    </Layout>
  )
}
