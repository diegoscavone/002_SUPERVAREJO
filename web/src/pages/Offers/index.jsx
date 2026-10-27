import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  parse,
  parseISO,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  isValid
} from 'date-fns'
import { Search, Tag, Trash2, Filter, X } from 'lucide-react'

// Serviços e Utilitários
import { api } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

// Componentes da Aplicação
import { Layout } from '../../components/Layout.jsx'
import { DataTable } from '../../components/DataTable'
import { ConfirmModal } from '../../components/ConfirmModal'
import { InputMask } from '../../components/InputMask' // ou @/components/InputMask dependendo do seu alias

// Componentes shadcn/ui
import { Button } from '@/components/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputCustom } from '@/components/InputCustom'

export function Offers() {
  const navigate = useNavigate()

  const [offers, setOffers] = useState([])
  const [selectedOffers, setSelectedOffers] = useState({})
  const [loading, setLoading] = useState(false)
  const [filteredOffers, setFilteredOffers] = useState([])

  // Filtros (Formato string: dd/MM/yyyy)
  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    applyFilters()
  }, [initialDate, finalDate, nameFilter, offers])

  function formatDate(dateString) {
    if (!dateString) return '---'
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? '---' : date.toLocaleDateString('pt-BR')
  }

  const offerColumns = useMemo(
    () => [
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
            active: {
              label: 'Ativa',
              className:
                'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800'
            },
            upcoming: {
              label: 'Futura',
              className:
                'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200 dark:text-amber-400 dark:border-amber-800'
            },
            expired: {
              label: 'Encerrada',
              className:
                'bg-rose-500/15 text-rose-700 hover:bg-rose-500/25 border-rose-200 dark:text-rose-400 dark:border-rose-800'
            }
          }

          const config = statusMap[status] || {
            label: 'Desconhecido',
            className: 'bg-zinc-100 text-zinc-600 border-zinc-200'
          }

          return (
            <Badge
              variant="outline"
              className={`font-semibold capitalize ${config.className}`}
            >
              {config.label}
            </Badge>
          )
        }
      }
    ],
    []
  )

  function applyFilters() {
    let result = [...offers]

    // Faz o parse do formato "dd/MM/yyyy" vindo do InputMask
    const parsedInitialDate =
      initialDate && initialDate.length === 10
        ? startOfDay(parse(initialDate, 'dd/MM/yyyy', new Date()))
        : null

    const parsedFinalDate =
      finalDate && finalDate.length === 10
        ? endOfDay(parse(finalDate, 'dd/MM/yyyy', new Date()))
        : null

    // Filtro por Data Inicial (A partir de):
    // A oferta deve terminar em ou após o início da data filtrada
    if (parsedInitialDate && isValid(parsedInitialDate)) {
      result = result.filter(offer => {
        const offerEnd = endOfDay(parseISO(offer.final_date))
        return offerEnd >= parsedInitialDate
      })
    }

    // Filtro por Data Final (Até):
    // A oferta deve iniciar em ou antes do fim da data filtrada
    if (parsedFinalDate && isValid(parsedFinalDate)) {
      result = result.filter(offer => {
        const offerStart = startOfDay(parseISO(offer.initial_date))
        return offerStart <= parsedFinalDate
      })
    }

    // Filtro por Nome
    if (nameFilter.trim()) {
      result = result.filter(offer =>
        offer.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
    }

    setFilteredOffers(result)
  }

  function clearFilters() {
    setInitialDate('')
    setFinalDate('')
    setNameFilter('')
    setFilteredOffers(offers)
  }

  async function fetchOffers() {
    try {
      setLoading(true)
      const response = await api.get('/offers')

      const processedOffers = response.data.map(offer => {
        const today = new Date()
        const startDate = new Date(offer.initial_date)
        const endDate = new Date(offer.final_date)
        endDate.setHours(23, 59, 59, 999)

        let status = 'active'
        if (today < startDate) status = 'upcoming'
        else if (today > endDate) status = 'expired'

        return {
          ...offer,
          status,
          products_count: offer.products ? offer.products.length : 0
        }
      })

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

  useEffect(() => {
    fetchOffers()
  }, [])

  async function handleConfirmDelete() {
    const selectedIds = Object.keys(selectedOffers).filter(
      id => selectedOffers[id]
    )

    try {
      setIsDeleting(true)
      await Promise.all(selectedIds.map(id => api.delete(`/offers/${id}`)))

      toastSuccess(`${selectedIds.length} oferta(s) excluída(s) com sucesso!`)
      setSelectedOffers({})
      setIsDeleteModalOpen(false)
      await fetchOffers()
    } catch (error) {
      console.error(error)
      toastError('Erro ao excluir as ofertas selecionadas.')
    } finally {
      setIsDeleting(false)
    }
  }

  const selectedCount = Object.keys(selectedOffers).filter(
    id => selectedOffers[id]
  ).length

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:px-8 space-y-3">
        {/* Cabeçalho Responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-4 sm:p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <h1 className="text-xl sm:text-xl font-bold tracking-tight text-green-600">
                Gestão de Ofertas
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Crie e gerencie campanhas promocionais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(prev => !prev)}
              className="gap-2 sm:hidden"
            >
              <Filter className="h-4 w-4" /> Filtros
            </Button>

            <Button
              type="button"
              label="Criar Nova Oferta"
              color="orange"
              icon={Tag}
              onClick={() => navigate('/offers/new')}
            />
          </div>
        </div>

        {/* Filtros Integrados com InputMask */}
        <div
          className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-card p-4 rounded-xl border border-border/60 transition-all`}
        >
          <div className="flex-1 space-y-1.5">
            <InputCustom
              label="Pesquisar Oferta"
              placeholder="Digite o nome da oferta..."
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
            />
          </div>

          <div className="w-full sm:w-44">
            <InputMask
              id="initial_date"
              name="initial_date"
              label="A partir de"
              mask="00/00/0000"
              placeholder="00/00/0000"
              value={initialDate}
              onChange={e => setInitialDate(e.target.value)}
              onEnter={applyFilters}
              showCalendar={true}
            />
          </div>

          <div className="w-full sm:w-44">
            <InputMask
              id="final_date"
              name="final_date"
              label="Até"
              mask="00/00/0000"
              placeholder="00/00/0000"
              value={finalDate}
              onChange={e => setFinalDate(e.target.value)}
              onEnter={applyFilters}
              showCalendar={true}
            />
          </div>
        </div>

        {/* Tabela de Ofertas / Empty State */}
        <Card className="bg-card border border-border/60 p-4 overflow-hidden shadow-none">
          <CardContent className="p-2 ">
            {filteredOffers.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <DataTable
                  data={filteredOffers}
                  columns={offerColumns}
                  onRowSelect={setSelectedOffers}
                  showSelectColumn={true}
                  showEditColumn={true}
                  handleEdit={id => navigate(`/offers/edit/${id}`)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-4">
                  <Search className="h-8 w-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Nenhuma oferta encontrada
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Não localizamos nenhuma oferta para os parâmetros aplicados.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-6 gap-2"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botão Flutuante de Exclusão em Massa */}
        {selectedCount > 0 && (
          <div className="sticky bottom-6 z-20 flex justify-start animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-2.5 rounded-2xl shadow-xl border border-white/10">
              <span className="text-xs font-semibold tracking-wide">
                {selectedCount} item(s) selecionado(s)
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={loading}
                className="gap-2 h-8 px-3 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        )}

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
            <p className="text-sm text-muted-foreground">
              Você tem certeza que deseja excluir{' '}
              <strong className="text-foreground">{selectedCount}</strong>{' '}
              oferta(s) selecionada(s)?
            </p>
          }
        />
      </div>
    </Layout>
  )
}
