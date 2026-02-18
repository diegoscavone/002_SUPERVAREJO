import { Container, Content, Message } from './styles.js'

import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DataTable } from '../../components/DataTable'

import { api, apiERP } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout/index.jsx'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field.jsx'
import { Input } from '@/components/ui/input'
import { Loader2, Printer, Trash2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ConfirmModal/index.jsx'

export function Print() {
  const navigate = useNavigate()

  const [posters, setPosters] = useState([])
  const [campaignsSelect, setCampaignsSelect] = useState([])
  const [campaignImages, setCampaignImages] = useState({})
  const [selectedPosters, setSelectedPosters] = useState({})
  const [loading, setLoading] = useState(false)

  const [hasSelectedPosters, setHasSelectedPosters] = useState(false)
  const [selectedPosterIdsToDelete, setSelectedPosterIdsToDelete] = useState([])

  const [filteredPosters, setFilteredPosters] = useState([])

  // const [initialDate, setInitialDate] = useState('')
  // const [finalDate, setFinalDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('0')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [descriptionFilter, setDescriptionFilter] = useState('')
  const [units, setUnits] = useState([])
  const [unitsFilter, setUnitsFilter] = useState('all')
  const [campaigns, setCampaigns] = useState([])
  const [campaignType, setCampaignType] = useState('all')

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const columns = [
    { id: 'id', accessorKey: 'id', header: 'ID', sortable: true },
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
      cell: ({ row }) => getCampaignName(row.original.campaign_id)
    },
    {
      id: 'initial_date',
      accessorKey: 'initial_date',
      header: 'Data Inicial',
      sortable: true,
      cell: ({ row }) => formatDate(row.original.initial_date)
    },
    {
      id: 'final_date',
      accessorKey: 'final_date',
      header: 'Data Final',
      sortable: true,
      cell: ({ row }) => formatDate(row.original.final_date)
    },
    { id: 'price', accessorKey: 'price', header: 'Oferta (R$)', sortable: true }
  ]

  useEffect(() => {
    if (!posters || posters.length === 0) {
      setFilteredPosters([])
      return
    }
    const isDescriptionValid =
      descriptionFilter.length === 0 || descriptionFilter.length >= 3
    if (isDescriptionValid) {
      let result = [...posters]

      if (statusFilter && statusFilter !== 'all') {
        result = result.filter(p => String(p.status) === statusFilter)
      }

      // Filtro de Unidade
      if (unitsFilter && unitsFilter !== 'all') {
        result = result.filter(p => String(p.unit) === unitsFilter)
      }

      // Filtro de Campanha
      if (campaignFilter && campaignFilter !== 'all') {
        result = result.filter(p => String(p.campaign_id) === campaignFilter)
      }

      // Filtro de Tipo de Campanha
      if (campaignType && campaignType !== 'all') {
        result = result.filter(p => String(p.campaign_type_id) === campaignType)
      }

      // Filtro de Descrição
      if (descriptionFilter.length >= 3) {
        result = result.filter(p =>
          p.description.toLowerCase().includes(descriptionFilter.toLowerCase())
        )
      }

      setFilteredPosters(result)
    }
  }, [
    statusFilter,
    descriptionFilter,
    unitsFilter,
    campaignFilter,
    campaignType,
    posters
  ])

  //Verifica qual checkbox está selecionado
  function handleCheckboxSelected(rowSelection) {
    setSelectedPosters(rowSelection)
  }

  async function fetchCampaigns() {
    try {
      const response = await api.get('/campaigns')
      setCampaignsSelect(response.data)
    } catch (error) {}
  }

  async function fetchPosters() {
    try {
      setLoading(true)
      const response = await api.get('/posters')

      setPosters(response.data)

      // Sincronização inicial:
      // Se você quer que ao carregar já mostre os status '0' (Não impressos)
      const initialFiltered = response.data.filter(
        poster => String(poster.status) === statusFilter
      )
      setFilteredPosters(initialFiltered)
    } catch (error) {
      console.error('Erro ao buscar cartazes:', error)
      toastError('Erro ao carregar cartazes.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCampaignImage(campaignId) {
    // Verificar se já temos no cache
    if (campaignImages[campaignId]) {
      return campaignImages[campaignId]
    }

    try {
      const response = await api.get(`campaigns/${campaignId}`, {
        responseType: 'blob'
      })

      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => {
          const imageData = reader.result
          setCampaignImages(prevImages => ({
            ...prevImages,
            [campaignId]: imageData
          }))
          resolve(imageData)
        }
        reader.readAsDataURL(response.data)
      })
    } catch (error) {
      console.error(`Erro ao buscar campanha ${campaignId}:`, error)
      return null
    }
  }

  async function fetchUnits() {
    try {
      const response = await apiERP.get('/units')
      setUnits(response.data)
    } catch (error) {
      console.error('Erro ao buscar unidades:', error)
    }
  }

  async function fetchCampaignTypes() {
    try {
      const response = await api.get('/campaigns-type')
      setCampaigns(response.data)
    } catch (error) {
      console.error('Erro ao buscar tipos de campanhas:', error)
    }
  }

  function formatDate(dateString) {
    if (!dateString) {
      return
    }
    const date = new Date(dateString)

    if (isNaN(date.getTime())) {
      return
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  useEffect(() => {
    fetchCampaigns()
    fetchPosters()
    fetchUnits()
    fetchCampaignTypes()
  }, [])

  function getCampaignName(campaignId) {
    const campaign = campaignsSelect.find(
      campaign => campaign.id === campaignId
    )
    return campaign ? campaign.name : 'Campanha não encontrada'
  }

  //Função altera o status do poster para 1 se ele ja foi impresso
  async function alterStatusPoster(selectedPosterIds, newStatus) {
    try {
      const updatedPosters = await Promise.all(
        selectedPosterIds.map(async posterId => {
          const response = await api.put(`/posters/${posterId}`, {
            status: newStatus
          })
          return response.data
        })
      )

      setPosters(prevPosters =>
        prevPosters.map(
          poster =>
            updatedPosters.find(updated => updated.id === poster.id) || poster
        )
      )
    } catch (error) {
      toastError('Erro ao alterar o status do(s) pôster(es).')
    }
  }

  async function printPoster() {
    const newStatus = 1
    const selectedIds = Object.keys(selectedPosters).filter(
      id => selectedPosters[id]
    )

    if (selectedIds.length === 0) {
      toastInfo('Selecione pelo menos um cartaz.')
      return
    }

    try {
      // 1. Inicia o loading e abre o Modal de Processamento
      setLoading(true)
      setIsGeneratingPDF(true)

      const selectedPosterIds = selectedIds.map(id => Number(id))
      const selectedPostersData = posters.filter(poster =>
        selectedPosterIds.includes(poster.id)
      )

      const uniqueCampaignIds = [
        ...new Set(selectedPostersData.map(poster => poster.campaign_id))
      ]
      const selectedCampaignImages = {}

      for (const campaignId of uniqueCampaignIds) {
        const imageData = await fetchCampaignImage(campaignId)
        if (imageData) {
          selectedCampaignImages[campaignId] = imageData
        }
      }

      const campaignId = campaignsSelect.find(
        campaign => campaign.id === selectedPostersData[0].campaign_id
      )

      const response = await api.post(
        '/posters-pdf',
        {
          selectedPosterIds,
          campaignImages: selectedCampaignImages,
          campaignId
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const printWindow = window.open(url, '_blank')

      if (printWindow) {
        printWindow.document.title = 'Impressão de Cartaz'
        await alterStatusPoster(selectedPosterIds, newStatus)
        toastSuccess('Cartazes gerados com sucesso!')
      } else {
        toastError('O bloqueador de pop-ups impediu a abertura do PDF.')
      }
    } catch (error) {
      console.error('Erro:', error.response || error)
      toastError('Erro ao gerar cartaz.')
    } finally {
      setLoading(false)
      setIsGeneratingPDF(false)
      setSelectedPosters({})
    }
  }

  async function deletePosters() {
    const selectedIds = Object.keys(selectedPosters).filter(
      id => selectedPosters[id]
    )

    if (selectedIds.length === 0) {
      toastInfo('Selecione pelo menos um cartaz.')
      return
    }

    try {
      const selectedPosterIds = selectedIds.map(id => Number(id))

      await api.delete(`/posters/${selectedPosterIds.join(',')}`)
      toastSuccess('Cartaz excluído com sucesso!')
      navigate('/print')
      await fetchPosters()
    } catch (error) {
      toastError('Erro ao excluir os cartazes.')
    } finally {
      // Limpar a seleção após a exclusão
      setSelectedPosters({})
      setSelectedPosterIdsToDelete([])
      setHasSelectedPosters(false)
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <Section title="Gestão de Cartazes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white rounded-xl">
              <Field className="flex flex-col gap-2">
                <FieldLabel>Situação</FieldLabel>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                  <SelectTrigger className="shadow-none focus:ring-green-600">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">Impressos</SelectItem>
                    <SelectItem value="0">Não Impressos</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Filtro: Tipo de Campanha */}
              <Field className="flex flex-col gap-2">
                <FieldLabel>Tipo de Campanha</FieldLabel>
                <Select onValueChange={setCampaignType} value={campaignType}>
                  <SelectTrigger className="shadow-none focus:ring-green-600">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {campaigns?.map(type => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Filtro: Campanha */}
              <Field className="flex flex-col gap-2">
                <FieldLabel>Campanha</FieldLabel>
                <Select
                  onValueChange={setCampaignFilter}
                  value={campaignFilter}
                >
                  <SelectTrigger className="shadow-none focus:ring-green-600">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as campanhas</SelectItem>
                    {campaignsSelect?.map(camp => (
                      <SelectItem key={camp.id} value={String(camp.id)}>
                        {camp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Filtro: Unidade */}
              <Field className="flex flex-col gap-2">
                <FieldLabel>Unidade</FieldLabel>
                <Select onValueChange={setUnitsFilter} value={unitsFilter}>
                  <SelectTrigger className="shadow-none focus:ring-green-600">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as unidades</SelectItem>
                    {units?.map(unit => (
                      <SelectItem
                        key={unit.unid_codigo}
                        value={String(unit.unid_codigo)}
                      >
                        {unit.unid_reduzido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Filtro: Descrição */}
              <Field className="flex flex-col gap-2">
                <FieldLabel>Descrição</FieldLabel>
                <Input
                  placeholder="Digite um produto para pesquisar..."
                  value={descriptionFilter}
                  onChange={e => setDescriptionFilter(e.target.value)}
                  className="shadow-none focus:ring-green-600"
                />
              </Field>
            </div>
          </Section>

          <Section>
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                <p className="text-slate-500 animate-pulse">
                  Carregando cartazes...
                </p>
              </div>
            ) : filteredPosters.length > 0 ? (
              <DataTable
                data={filteredPosters}
                columns={columns}
                onRowSelect={handleCheckboxSelected}
                showSelectColumn={true}
                enableRowSelection={true}
                actionType="edit" // OU "edit"
                handleAction={data => console.log('Ação disparada para:', data)}
              />
            ) : (
              <Message>
                <p className="text-slate-400 text-xs">
                  Nenhum cartaz encontrado com os filtros aplicados.
                </p>
              </Message>
            )}
          </Section>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-4 mt-2">
            <Button
              onClick={printPoster}
              disabled={loading || filteredPosters.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Printer className="mr-2 h-5 w-5" />
              )}
              Imprimir
            </Button>

            <Button
              variant="outline"
              onClick={deletePosters}
              disabled={loading || filteredPosters.length === 0}
              className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
            >
              <Trash2 className="mr-2 h-5 w-5" /> Excluir
            </Button>
          </div>

          {isGeneratingPDF && (
            <ConfirmModal
              isOpen={isGeneratingPDF}
              title="Gerando Cartazes"
              content={
                <div className="flex flex-col gap-0 text-center items-center">
                  <span>Estamos preparando os arquivos para impressão.</span>
                  <span className="font-medium text-green-600">
                    Por favor aguarde...
                  </span>
                </div>
              }
              icon={() => (
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              )}
              variant="success"
              isLoading={true}
            />
          )}
        </Content>
      </Container>
    </Layout>
  )
}
