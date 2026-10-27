import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock,
  Loader2,
  Pencil,
  Printer,
  Search,
  Trash2
} from 'lucide-react'

import { Layout } from '@/components/Layout.jsx'
import { DataTable } from '../../components/DataTable.jsx'
import { ConfirmModal } from '@/components/ConfirmModal/index.jsx'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/Button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field.jsx'
import { Card, CardContent } from '@/components/ui/card'

import { api, apiERP } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import { SelectCustom } from '@/components/SelectCustom.jsx'
import { InputCustom } from '@/components/InputCustom.jsx'

export function Print() {
  const navigate = useNavigate()

  // Sessão do utilizador
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('@posters:user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const isAdmin = user?.role === 'admin'
  const defaultUnit = user?.unit ? String(Number(user.unit)) : 'all'

  // Dados remotos
  const [posters, setPosters] = useState([])
  const [campaignsSelect, setCampaignsSelect] = useState([])
  const [campaignTypes, setCampaignTypes] = useState([])
  const [units, setUnits] = useState([])

  // Filtros
  const [statusFilter, setStatusFilter] = useState('0') // 0 = Não Impressos
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [campaignTypeFilter, setCampaignTypeFilter] = useState('all')
  const [unitsFilter, setUnitsFilter] = useState(defaultUnit)
  const [descriptionFilter, setDescriptionFilter] = useState('')

  // Estados de controlo
  const [selectedPosters, setSelectedPosters] = useState({})
  const [loading, setLoading] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatDate = useCallback(dateString => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    if (isNaN(date.getTime()) || date.getFullYear() <= 1970) return '-'

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }, [])

  const columns = useMemo(
    () => [
      // { id: 'id', accessorKey: 'id', header: 'ID', sortable: true },
      {
        id: 'product_id',
        accessorKey: 'product_id',
        header: 'Código',
        sortable: true
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: 'Descrição',
        sortable: true
      },
      { id: 'unit', accessorKey: 'unit', header: 'Loja', sortable: true },
      {
        id: 'campaign_id',
        accessorKey: 'campaign_id',
        header: 'Campanha',
        sortable: true,
        cell: ({ row }) => {
          const camp = campaignsSelect.find(
            c => Number(c.id) === Number(row.original.campaign_id)
          )
          return camp?.name || row.original.campaign?.name || 'Geral'
        }
      },
      {
        id: 'initial_date',
        accessorKey: 'initial_date',
        header: 'Data Inicial',
        sortable: true,
        cell: ({ row }) => {
          const camp = campaignsSelect.find(
            c => Number(c.id) === Number(row.original.campaign_id)
          )
          if (camp?.is_vencimento || row.original.campaign?.is_vencimento) {
            return (
              <span className="text-muted-foreground text-xs font-medium">
                N/A
              </span>
            )
          }
          return formatDate(row.original.initial_date)
        }
      },
      {
        id: 'final_date',
        accessorKey: 'final_date',
        header: 'Data Final',
        sortable: true,
        cell: ({ row }) => formatDate(row.original.final_date)
      },
      {
        id: 'price',
        accessorKey: 'price',
        header: 'Oferta (R$)',
        sortable: true
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            variant="ghost"
            size="icon"
            className="text-zinc-600 hover:text-blue-700"
            onClick={() => navigate(`/details/${row.original.id}`)}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )
      }
    ],
    [campaignsSelect, formatDate, navigate]
  )

  // Filtragem tolerante a tipos
  const filteredPosters = useMemo(() => {
    if (!posters.length) return []

    return posters.filter(item => {
      // Comparação tolerante de estado (converte null/undefined para 0)
      const itemStatus = Number(item.status ?? 0)
      const matchStatus =
        statusFilter === 'all' || itemStatus === Number(statusFilter)

      // Comparação numérica de loja
      const matchUnit =
        unitsFilter === 'all' ||
        (item.unit !== null &&
          item.unit !== undefined &&
          Number(item.unit) === Number(unitsFilter))

      // Comparação de campanha
      const matchCampaign =
        campaignFilter === 'all' ||
        Number(item.campaign_id) === Number(campaignFilter)

      // Comparação de tipo de campanha
      const matchType =
        campaignTypeFilter === 'all' ||
        Number(item.campaign_type_id) === Number(campaignTypeFilter)

      // Filtro de texto (mínimo de 3 caracteres)
      const matchDesc =
        descriptionFilter.trim().length < 3 ||
        item.description
          ?.toLowerCase()
          .includes(descriptionFilter.trim().toLowerCase())

      return matchStatus && matchUnit && matchCampaign && matchType && matchDesc
    })
  }, [
    posters,
    statusFilter,
    unitsFilter,
    campaignFilter,
    campaignTypeFilter,
    descriptionFilter
  ])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [campaignsRes, postersRes, typesRes] = await Promise.all([
        api.get('/campaigns').catch(() => ({ data: [] })),
        api.get('/posters').catch(() => ({ data: [] })),
        api.get('/campaigns-type').catch(() => ({ data: [] }))
      ])

      setCampaignsSelect(campaignsRes.data || [])
      setPosters(postersRes.data || [])
      setCampaignTypes(typesRes.data || [])

      if (isAdmin) {
        const unitsRes = await apiERP.get('/units').catch(() => ({ data: [] }))
        setUnits(unitsRes.data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toastError('Erro ao carregar cartazes.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    setSelectedPosters({})
  }, [statusFilter, campaignFilter, campaignTypeFilter, unitsFilter])

  async function handlePrintPosters() {
    const selectedIds = Object.keys(selectedPosters)
      .filter(id => selectedPosters[id])
      .map(Number)

    if (selectedIds.length === 0) {
      return toastInfo('Selecione pelo menos um cartaz.')
    }

    try {
      setIsGeneratingPDF(true)
      const response = await api.post(
        '/posters-pdf',
        { selectedPosterIds: selectedIds },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        // Atualiza status para impresso (1)
        await Promise.all(
          selectedIds.map(id => api.put(`/posters/${id}`, { status: 1 }))
        )
        toastSuccess('Cartazes gerados com sucesso!')
        setSelectedPosters({})
        await loadData()
      } else {
        toastError('O bloqueador de pop-ups impediu a abertura do documento.')
      }
    } catch (error) {
      console.error('Erro na impressão:', error)
      toastError('Erro ao gerar cartazes para impressão.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  async function handleDeletePosters() {
    const selectedIds = Object.keys(selectedPosters)
      .filter(id => selectedPosters[id])
      .map(Number)

    if (selectedIds.length === 0) return

    try {
      await api.delete(`/posters/${selectedIds.join(',')}`)
      toastSuccess('Cartazes eliminados com sucesso!')
      setSelectedPosters({})
      await loadData()
    } catch {
      toastError('Erro ao eliminar os cartazes.')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  const selectedCount = Object.values(selectedPosters).filter(Boolean).length

  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-4 sm:p-6 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold tracking-tight text-green-600">
                Impressão
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Faça a impressão e gestão dos cartazes criados.
            </p>
          </div>
        </div>
        {/* Painel de Filtros */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-4 sm:p-6">
            {/* Container com Grid de 12 colunas */}
            <div className="grid grid-cols-12 gap-4">
              {/* 1. Situação: Menor (ex: 2 colunas no desktop) */}
              <SelectCustom
                label="Situação"
                id="status_filter"
                placeholder="Situação"
                value={statusFilter}
                onValueChange={setStatusFilter}
                containerClassName="col-span-12 sm:col-span-6 lg:col-span-2"
              >
                <option value="all">Todos</option>
                <option value="0">Não Impressos</option>
                <option value="1">Impressos</option>
              </SelectCustom>

              {/* 2. Tipo de Campanha: Médio (ex: 2 colunas no desktop) */}
              <SelectCustom
                label="Tipo de Campanha"
                id="campaign_type_filter"
                placeholder="Todos os tipos"
                value={campaignTypeFilter}
                onValueChange={setCampaignTypeFilter}
                containerClassName="col-span-12 sm:col-span-6 lg:col-span-2"
              >
                <option value="all">Todos os tipos</option>
                {campaignTypes.map(type => (
                  <option key={type.id} value={String(type.id)}>
                    {type.name}
                  </option>
                ))}
              </SelectCustom>

              {/* 3. Campanha: Mais largo pois nomes de campanhas são longos (ex: 3 colunas) */}
              <SelectCustom
                label="Campanha"
                id="campaign_filter"
                placeholder="Campanha"
                value={campaignFilter}
                onValueChange={setCampaignFilter}
                containerClassName="col-span-12 sm:col-span-6 lg:col-span-3"
              >
                <option value="all">Todas as campanhas</option>
                {campaignsSelect.map(camp => (
                  <option key={camp.id} value={String(camp.id)}>
                    {camp.name}
                  </option>
                ))}
              </SelectCustom>

              {/* 4. Unidade (Admin): Tamanho compacto (ex: 2 colunas) */}
              {isAdmin && (
                <SelectCustom
                  label="Unidade"
                  id="units_filter"
                  placeholder="Loja"
                  value={unitsFilter}
                  onValueChange={setUnitsFilter}
                  containerClassName="col-span-12 sm:col-span-6 lg:col-span-2"
                >
                  <option value="all">Todas as unidades</option>
                  {units.map(unit => (
                    <option
                      key={unit.unid_codigo}
                      value={String(Number(unit.unid_codigo))}
                    >
                      {unit.unid_reduzido}
                    </option>
                  ))}
                </SelectCustom>
              )}

              {/* 5. Descrição: Campo de busca/texto (ocupa o restante das colunas) */}
              <InputCustom
                label="Descrição"
                id="description_filter"
                placeholder="Pesquisar por produto..."
                value={descriptionFilter}
                onChange={e => setDescriptionFilter(e.target.value)}
                containerClassName={
                  isAdmin
                    ? 'col-span-12 sm:col-span-12 lg:col-span-3' // 2 + 2 + 3 + 2 + 3 = 12 colunas
                    : 'col-span-12 sm:col-span-6 lg:col-span-5' // 2 + 2 + 3 + 5 = 12 colunas
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Listagem */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 sm:p-20 gap-4">
              <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-500 animate-pulse">
                A carregar registos...
              </p>
            </div>
          ) : filteredPosters.length > 0 ? (
            <div className="overflow-x-auto">
              <DataTable
                data={filteredPosters}
                columns={columns}
                onRowSelect={setSelectedPosters}
                showSelectColumn={true}
                enableRowSelection={true}
                defaultPageSize={80}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xs mb-3">
                <Search className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Nenhum cartaz encontrado
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Não foram localizados cartazes com os filtros ativos. Verifique
                o estado (Não Impressos / Impressos) ou a loja selecionada.
              </p>
            </div>
          )}
        </section>

        {/* Renderiza o footer de ações apenas se houver itens selecionados */}
        {selectedCount > 0 && (
          <div className="sticky bottom-6 z-30 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-200 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-zinc-900 text-zinc-100 dark:bg-zinc-950 px-4 py-3 rounded-2xl shadow-2xl border border-white/10 w-full sm:w-auto backdrop-blur-md">
              {/* Contador de selecionados */}
              <div className="flex items-center justify-center sm:justify-start gap-2 shrink-0 px-1">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-zinc-200">
                  <strong className="text-white font-semibold">
                    {selectedCount}
                  </strong>{' '}
                  {selectedCount === 1
                    ? 'cartaz selecionado'
                    : 'cartazes selecionados'}
                </span>
              </div>

              <div className="h-4 w-px bg-zinc-800 hidden sm:block shrink-0" />

              {/* Ações */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <Button
                  label="Excluir"
                  type="button"
                  color="red"
                  icon={Trash2}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading || isGeneratingPDF}
                  className="w-full sm:w-auto h-9 text-xs font-semibold px-3 rounded-xl gap-1.5 transition-colors"
                />

                <Button
                  label="Imprimir"
                  type="button"
                  color="orange"
                  icon={Printer}
                  onClick={handlePrintPosters}
                  disabled={loading || isGeneratingPDF}
                  className="w-full sm:w-auto h-9 text-xs font-semibold px-4 rounded-xl shadow-sm gap-1.5 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modais */}
        {isGeneratingPDF && (
          <ConfirmModal
            isOpen={isGeneratingPDF}
            title="A Gerar Cartazes"
            content={
              <div className="flex flex-col items-center text-center space-y-1">
                <span className="text-slate-600">
                  A compilar o documento PDF para impressão.
                </span>
                <span className="font-semibold text-emerald-600">
                  Por favor, aguarde...
                </span>
              </div>
            }
            icon={() => (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            )}
            variant="success"
            isLoading={true}
          />
        )}

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeletePosters}
          title="Eliminar Cartazes"
          content={`Tem a certeza que deseja eliminar os ${selectedCount} cartazes selecionados? Esta ação não pode ser desfeita.`}
          icon={Trash2}
          variant="destructive"
          confirmButtonText="Sim, Eliminar"
        />
      </main>
    </Layout>
  )
}
