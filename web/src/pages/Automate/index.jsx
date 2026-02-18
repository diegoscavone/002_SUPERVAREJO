import {
  Container,
  Content,
  Form,
  InputWrapper,
  Label,
  Message
} from './styles'

import { Header } from '../../components/Header'
import { Nav } from '../../components/Nav'
import { Footer } from '../../components/Footer'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { InputMask } from '../../components/InputMask'
import { Section } from '../../components/Section'
import { DataTable } from '../../components/DataTable'

import { useEffect, useState } from 'react'

import { api, apiERP } from '../../services/api'

import { useCreatedPoster } from '../../hooks/createdPoster'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import { PiMagnifyingGlass, PiPlayCircle, PiCalendarDots } from 'react-icons/pi'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import { formatDate } from 'date-fns'
import { Layout } from '@/components/Layout'
export function Automate() {
  const navigate = useNavigate()
  const [unit, setUnit] = useState('')
  const [date, setDate] = useState('')
  const [sale, setSale] = useState([])

  const [posters, setPosters] = useState([])
  const [selectedPosters, setSelectedPosters] = useState({})
  const handleCreatePoster = useCreatedPoster()

  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [campaignTypeSelected, setCampaignTypeSelected] = useState(1)

  const [loading, setLoading] = useState(false)

  const productColumns = [
    { accessorKey: 'product_id', header: 'Código', enableSorting: true },
    { accessorKey: 'description', header: 'Descrição', enableSorting: true },
    // { accessorKey: 'complement', header: 'Complemento', enableSorting: true },
    // { accessorKey: 'packaging', header: 'Emb', enableSorting: true },
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
    { accessorKey: 'price', header: 'Preço' }
  ]

  function handleCampaignsChange(event) {
    setCampaignSelected(event.target.value)
  }

  async function fetchSale() {
    if (!unit || !date) {
      toastInfo('Todos os campos são obrigatórios')
      return
    }

    try {
      const response = await apiERP.get(`/posters?unit=${unit}&date=${date}`)

      if (!response.data || response.data.length === 0) {
        toastInfo('Nenhuma oferta econtrada com a data informada.')
        setDate(null)
        return
      }
      setSale(response.data)
    } catch {
      toastError('Não foi possível encontrar o produto em oferta.')
    }
  }

  function handleSearch() {
    fetchSale()
  }

  function formatDate(date) {
    const dateFormat = new Date(date)
    const dia = String(dateFormat.getDate()).padStart(2, '0')
    const mes = String(dateFormat.getMonth() + 1).padStart(2, '0')
    const ano = dateFormat.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  async function handleAutomate() {
    if (
      Object.keys(selectedPosters).filter(posterId => selectedPosters[posterId])
        .length === 0 ||
      campaignSelected.length === 0
    ) {
      toastInfo('Nenhum produto ou campanha selecionado.')
      return
    }
    try {
      setLoading(true)

      // const selectedProducts = Object.keys(selectedPosters)
      // .filter(posterIndex => selectedPosters[posterIndex])
      // .map(index => sale[Number(index)])

      const selectedProducts = sale.filter(
        product => selectedPosters[product.prod_codigo]
      )

      for (const product of selectedProducts) {
        const productInputs = {
          product_id: product.prod_codigo,
          description: product.prod_descricao,
          complement: product.prod_complemento,
          packaging: product.prod_emb,
          price: product.prpr_prvenda,
          initial_date: product.prpr_datainicial,
          final_date: product.prpr_datafinal,
          campaignsSelected: campaignSelected,
          campaignTypeSelected: campaignTypeSelected,
          unit: product.prpr_unid_codigo
        }

        const formatedDateInitial = formatDate(productInputs.initial_date)
        const formatedDateFinal = formatDate(productInputs.final_date)

        await handleCreatePoster(
          productInputs,
          formatedDateInitial,
          formatedDateFinal,
          campaignSelected,
          campaignTypeSelected
        )
      }
      toastSuccess('Cartazes Criado com sucesso!')
      setTimeout(() => {
        navigate('/print')
      }, 2000)
    } catch (error) {
      toastError('Não foi possivel cadastrar os cartazes.' + error.message)
      console.log(error.message)
    }
  }

  useEffect(() => {
    async function fetchCampaign() {
      const response = await api.get('campaigns')
      setCampaigns(response.data)
    }
    fetchCampaign()
  }, [])

  function handleCheckboxSelected(rowSelection) {
    setSelectedPosters(rowSelection)
  }

  return (
    <Layout>
      <Container>
        <Header />
        <Nav />
        <ToastContainer />
        <Content>
          <Section title="Gestão de Ofertas">
            <Form>
              <InputWrapper>
                <Label>Código da Unidade</Label>
                <InputMask
                  mask="000"
                  placeholder="000"
                  type="text"
                  onChange={e => setUnit(e.target.value)}
                />
              </InputWrapper>

              <InputWrapper>
                <Label>Data Inicial da Oferta</Label>
                <InputMask
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  type="text"
                  icon={PiCalendarDots}
                  value={date}
                  onFocus={() => setDate(null)}
                  onChange={e => setDate(e.target.value)}
                />
              </InputWrapper>

              <InputWrapper>
                <div>
                  <Button
                    title="Buscar"
                    icon={PiMagnifyingGlass}
                    color="GREEN"
                    onClick={handleSearch}
                  />
                </div>
              </InputWrapper>
            </Form>
          </Section>
          <Section>
            {sale.length === 0 ? (
              <Message>
                <p>Você ainda não pesquisou nenhum produto em oferta.</p>
              </Message>
            ) : (
              <Table
                data={sale.map(saleItem => ({
                  id: saleItem.prod_codigo,
                  product_id: saleItem.prod_codigo,
                  description: saleItem.prod_descricao,
                  complement: saleItem.prod_complemento,
                  packaging: saleItem.prod_emb,
                  price: saleItem.prpr_prvenda, // Substitui ponto por vírgula
                  initial_date: saleItem.prpr_datainicial || null, // Atribui null se a data for undefined
                  final_date: saleItem.prpr_datafinal || null
                }))}
                columns={productColumns}
                selectedPosters={selectedPosters}
                onRowSelect={handleCheckboxSelected}
                showEditColumn={false}
                showSelectColumn={true}
              />
            )}
          </Section>
          <Section>
            <Form>
              <InputWrapper>
                <Label>Selecione uma campanha</Label>
                <Select onChange={handleCampaignsChange}>
                  <option value={0}>Selecione</option>
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
                <Button
                  title={loading ? 'Criando aguarde...' : 'Iniciar Automação'}
                  icon={PiPlayCircle}
                  color="ORANGE"
                  onClick={handleAutomate}
                  disabled={loading}
                />
              </InputWrapper>
            </Form>
          </Section>
        </Content>
        <Footer />
      </Container>
    </Layout>
  )
}
