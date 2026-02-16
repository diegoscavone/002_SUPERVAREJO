import {
  Container,
  Content,
  ButtonWrapper,
  InputWrapper,
  Label,
  Form,
  ButtonSearch,
  Message,
  SelectWrapper
} from './styles.js'

import { PiFunnel, PiPrinter, PiTrash } from 'react-icons/pi'

import { Header } from '../../components/Header'
import { Nav } from '../../components/Nav'
import { Footer } from '../../components/Footer'
import { Button } from '../../components/Button'
import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import { api, apiERP } from '../../services/api'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { Select } from '../../components/Select'
import { Input } from '../../components/Input'
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

  const [initialDate, setInitialDate] = useState('')
  const [finalDate, setFinalDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('0')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [descriptionFilter, setDescriptionFilter] = useState('')
  const [units, setUnits] = useState([])
  const [unitsFilter, setUnitsFilter] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignType, setCampaignType] = useState('')

  // const posterColumns = [
  //   { accessorKey: 'id', header: 'ID', enableSorting: true },
  //   { accessorKey: 'product_id', header: 'Código', enableSorting: true },
  //   { accessorKey: 'description', header: 'Descrição', enableSorting: true },
  //   // { accessorKey: 'complement', header: 'Comp.', enableSorting: true },
  //   { accessorKey: 'campaign_id', header: 'Campanha', enableSorting: true },
  //   // { accessorKey: 'packaging', header: 'Emb', enableSorting: true },
  //   {
  //     accessorKey: 'initial_date',
  //     header: 'Data Inicial',
  //     cell: ({ getValue }) => formatDate(getValue()),
  //     enableSorting: true
  //   },
  //   {
  //     accessorKey: 'final_date',
  //     header: 'Data Final',
  //     cell: ({ getValue }) => formatDate(getValue()),
  //     enableSorting: true
  //   },
  //   { accessorKey: 'price', header: 'Preço' }
  // ]

  // ]

  const columns = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID',
      sortable: true
    },
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
    {
      id: 'price',
      accessorKey: 'price',
      header: 'Preço',
      sortable: true
    }
  ]

  function applyFilters() {
    let filtered = posters

    // Parse dates to compare
    const parsedInitialDate = initialDate
      ? parse(initialDate, 'dd/MM/yyyy', new Date())
      : null
    const parsedFinalDate = finalDate
      ? parse(finalDate, 'dd/MM/yyyy', new Date())
      : null

    if (parsedInitialDate) {
      filtered = filtered.filter(poster => {
        const posterDate = parseISO(poster.initial_date)
        return isAfter(posterDate, startOfDay(parsedInitialDate))
      })
    }

    if (parsedFinalDate) {
      filtered = filtered.filter(poster => {
        const posterDate = parseISO(poster.final_date)
        return isBefore(posterDate, endOfDay(parsedFinalDate))
      })
    }

    if (statusFilter === '0') {
      filtered = filtered.filter(poster => poster.status === 0)
    } else if (statusFilter === '1') {
      filtered = filtered.filter(poster => poster.status === 1)
    }

    if (campaignFilter) {
      filtered = filtered.filter(
        poster => poster.campaign_id === parseInt(campaignFilter)
      )
    }

    if (descriptionFilter) {
      filtered = filtered.filter(poster =>
        poster.description
          .toLowerCase()
          .includes(descriptionFilter.toLowerCase())
      )
    }

    if (unitsFilter) {
      filtered = filtered.filter(poster => poster.unit === unitsFilter)
    }
    if (campaignType) {
      filtered = filtered.filter(poster => {
        // Supondo que o objeto poster tenha uma propriedade campaign_type_id
        // Se tiver um nome de propriedade diferente, ajuste de acordo
        return poster.campaign_type_id === parseInt(campaignType)
      })
    }
    setFilteredPosters(filtered)
  }

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

  // async function fetchPosters() {
  //   try {
  //     const response = await api.get('/posters')
  //     setPosters(response.data)
  //     setFilteredPosters(response.data.filter(poster => poster.status === 0))

  //     response.data.forEach(async poster => {
  //       const responseCampaign = await api.get(
  //         `campaigns/${poster.campaign_id}`,
  //         { responseType: 'blob' }
  //       )

  //       const reader = new FileReader()
  //       reader.onload = () => {
  //         setCampaignImages(prevImages => ({
  //           ...prevImages,
  //           [poster.campaign_id]: reader.result
  //         }))
  //       }
  //       reader.readAsDataURL(responseCampaign.data)
  //     })
  //   } catch (error) {
  //     console.error('Erro ao buscar cartazes:', error)
  //   }
  // }

  async function fetchPosters() {
    try {
      const response = await api.get('/posters')
      setPosters(response.data)
      setFilteredPosters(response.data.filter(poster => poster.status === 0))
      // Não buscar imagens aqui - buscar sob demanda
    } catch (error) {
      console.error('Erro ao buscar cartazes:', error)
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

  //Função que gera o pdf do poster
  // async function printPoster() {
  //   const newStatus = 1
  //   const selectedIds = Object.keys(selectedPosters).filter(
  //     id => selectedPosters[id]
  //   )

  //   if (selectedIds.length === 0) {
  //     toastInfo('Selecione pelo menos um cartaz.')
  //     return
  //   }

  //   try {
  //     setLoading(true)
  //     const selectedPosterIds = selectedIds.map(id => Number(id))

  //     const selectedPostersData = posters.filter(poster =>
  //       selectedPosterIds.includes(poster.id)
  //     )

  //     const selectedCampaignImages = selectedPostersData.reduce(
  //       (acc, poster) => {
  //         if (
  //           poster &&
  //           poster.campaign_id &&
  //           campaignImages[poster.campaign_id]
  //         ) {
  //           acc[poster.campaign_id] = campaignImages[poster.campaign_id]
  //         }
  //         return acc
  //       },
  //       {}
  //     )

  //     const campaignId = campaignsSelect.find(
  //       campaign => campaign.id === selectedPostersData[0].campaign_id
  //     )

  //     const response = await api.post(
  //       '/posters-pdf',
  //       {
  //         selectedPosterIds,
  //         campaignImages: selectedCampaignImages,
  //         campaignId
  //       },
  //       {
  //         responseType: 'blob'
  //       }
  //     )

  //     const blob = new Blob([response.data], { type: 'application/pdf' })
  //     const url = window.URL.createObjectURL(blob)

  //     const printWindow = window.open(url, '_blank')
  //     if (printWindow) {
  //       printWindow.document.title = 'Impressão de Cartaz'
  //       printWindow.onload = function () {
  //         printWindow.focus()
  //         printWindow.print() // Disparar a impressão do PDF
  //       }
  //       await alterStatusPoster(selectedPosterIds, newStatus)
  //     } else {
  //       // Caso não consiga abrir a nova aba
  //       toastError('Falha ao abrir a nova aba para visualização do PDF.')
  //     }
  //   } catch (error) {
  //     console.error('Erro:', error.response || error)
  //     toastError('Erro ao gerar cartaz.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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
      setLoading(true)
      const selectedPosterIds = selectedIds.map(id => Number(id))

      const selectedPostersData = posters.filter(poster =>
        selectedPosterIds.includes(poster.id)
      )

      // Buscar apenas as imagens necessárias
      const uniqueCampaignIds = [
        ...new Set(selectedPostersData.map(poster => poster.campaign_id))
      ]

      const selectedCampaignImages = {}

      // Buscar imagens uma por vez para não sobrecarregar
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
        {
          responseType: 'blob'
        }
      )

      // Resto do código permanece igual...
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.document.title = 'Impressão de Cartaz'
        printWindow.onload = function () {
          printWindow.focus()
          printWindow.print()
        }
        await alterStatusPoster(selectedPosterIds, newStatus)
      } else {
        toastError('Falha ao abrir a nova aba para visualização do PDF.')
      }
    } catch (error) {
      console.error('Erro:', error.response || error)
      toastError('Erro ao gerar cartaz.')
    } finally {
      setLoading(false)
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
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Section title="Gestão de Cartazes">
          <Form>
            <SelectWrapper>
              <Label>Situação</Label>
              <Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="1">Impressos</option>
                <option value="0">Não Impressos</option>
              </Select>
            </SelectWrapper>
            <SelectWrapper>
              <Label>Campanha</Label>
              <Select
                value={campaignFilter}
                onChange={e => setCampaignFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {campaignsSelect.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </SelectWrapper>
            <SelectWrapper>
              <Label>Unidade</Label>
              <Select
                value={unitsFilter}
                onChange={e => setUnitsFilter(e.target.value)}
              >
                <option value="">Todas</option>
                {units.map(unit => (
                  <option key={unit.unid_codigo} value={unit.unid_codigo}>
                    {unit.unid_reduzido}
                  </option>
                ))}
              </Select>
            </SelectWrapper>
            <SelectWrapper>
              <Label>Tipo de Campanha</Label>
              <Select
                value={campaignType}
                onChange={e => setCampaignType(e.target.value)}
              >
                <option value="">Todas</option>
                {campaigns.map(campaignType => (
                  <option key={campaignType.id} value={campaignType.id}>
                    {campaignType.name}
                  </option>
                ))}
              </Select>
            </SelectWrapper>
            <InputWrapper>
              <Label>Descrição</Label>
              <Input
                id="descriptionFilter"
                placeholder="Digite a descrição do produto"
                type="text"
                value={descriptionFilter}
                onChange={e => setDescriptionFilter(e.target.value)}
              />
            </InputWrapper>
            <ButtonSearch>
              <Button
                title="Filtrar"
                icon={PiFunnel}
                color="GREEN"
                onClick={applyFilters}
              />
            </ButtonSearch>
          </Form>
        </Section>
        <Section>
          {filteredPosters.length > 0 ? (
            <PostersTable
              data={filteredPosters}
              columns={columns}
              selectedPosters={selectedPosters}
              onRowSelect={handleCheckboxSelected}
              showSelectColumn={true}
              showEditColumn={true}
              editType="posters"
            />
          ) : (
            <Message>
              <p>Nenhum cartaz encontrado para os filtros selecionados.</p>
            </Message>
          )}
        </Section>
        <Section>
          <ButtonWrapper>
            <Button
              title={loading ? 'Aguarde...' : 'Imprimir'}
              icon={PiPrinter}
              color="ORANGE"
              onClick={printPoster}
              disabled={loading}
            />

            <Button
              title="Excluir"
              icon={PiTrash}
              color="RED"
              onClick={deletePosters}
            />
          </ButtonWrapper>
        </Section>
      </Content>

      <Footer />
    </Container>
  )
}
