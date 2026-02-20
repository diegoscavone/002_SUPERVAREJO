import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { PiCalendarDots, PiMagnifyingGlass, PiPlayCircle } from 'react-icons/pi'
import { CirclePlay, Search, Loader2 } from 'lucide-react'

import { api, apiERP } from '../../services/api'
import { useCreatedPoster } from '../../hooks/createdPoster'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout'
import { Section } from '../../components/Section'
import { DataTable } from '../../components/DataTable' // Seu componente robusto
import { InputMask } from '../../components/InputMask'
import { Field, FieldLabel } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { Container, Content, Message } from './styles'

export function Automate() {
  const navigate = useNavigate()
  const handleCreatePoster = useCreatedPoster()

  const [unit, setUnit] = useState('')
  const [date, setDate] = useState('')
  const [sale, setSale] = useState([])
  const [selectedPosters, setSelectedPosters] = useState({})
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // Definição das Colunas para o DataTable
  const productColumns = [
    { accessorKey: 'product_id', header: 'Código', enableSorting: true },
    { accessorKey: 'description', header: 'Descrição', enableSorting: true },
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
      accessorKey: 'price',
      header: 'Preço',
      cell: ({ getValue }) => `R$ ${getValue()}`
    }
  ]

  async function fetchSale() {
    if (!unit || !date) {
      return toastInfo('Todos os campos são obrigatórios')
    }

    try {
      setSearching(true)
      const response = await apiERP.get(`/posters?unit=${unit}&date=${date}`)

      if (!response.data || response.data.length === 0) {
        toastInfo('Nenhuma oferta encontrada com a data informada.')
        setSale([])
        return
      }

      // Mapeamos os dados para o formato que o DataTable espera (com ID único)
      const formattedData = response.data.map(item => ({
        id: String(item.prod_codigo), // O DataTable usa o 'id' para seleção
        product_id: item.prod_codigo,
        description: item.prod_descricao,
        complement: item.prod_complemento,
        packaging: item.prod_emb,
        price: item.prpr_prvenda,
        initial_date: item.prpr_datainicial,
        final_date: item.prpr_datafinal,
        prpr_unid_codigo: item.prpr_unid_codigo
      }))

      setSale(formattedData)
    } catch {
      toastError('Não foi possível encontrar os produtos em oferta.')
    } finally {
      setSearching(false)
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '-'
    const dateFormat = new Date(dateString)
    return dateFormat.toLocaleDateString('pt-BR')
  }

  async function handleAutomate() {
    // Pegamos apenas as chaves (IDs) que estão marcadas como true
    const selectedIds = Object.keys(selectedPosters).filter(
      id => selectedPosters[id]
    )

    if (selectedIds.length === 0 || !campaignSelected) {
      return toastInfo('Nenhum produto ou campanha selecionado.')
    }

    try {
      setLoading(true)
      const selectedProducts = sale.filter(product =>
        selectedIds.includes(String(product.id))
      )

      for (const product of selectedProducts) {
        const productInputs = {
          product_id: product.product_id,
          description: product.description,
          complement: product.complement,
          packaging: product.packaging,
          price: product.price,
          unit: product.prpr_unid_codigo
        }

        const dateInit = formatDate(product.initial_date)
        const dateEnd = formatDate(product.final_date)

        await handleCreatePoster(
          productInputs,
          dateInit,
          dateEnd,
          campaignSelected,
          1
        )
      }

      toastSuccess('Cartazes criados com sucesso!')
      setTimeout(() => navigate('/print'), 2000)
    } catch (error) {
      toastError('Erro ao cadastrar cartazes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function fetchCampaigns() {
      const response = await api.get('campaigns')
      setCampaigns(response.data)
    }
    fetchCampaigns()
  }, [])

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <Section>
            <div className="flex items-end gap-4 bg-white rounded-xl">
              <Field className="w-36">
                <FieldLabel>Unidade</FieldLabel>
                <InputMask
                  mask="000"
                  placeholder="000"
                  onChange={e => setUnit(e.target.value)}
                />
              </Field>

              <Field className="w-48">
                <FieldLabel>Data Inicial da Oferta</FieldLabel>
                <InputMask
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  icon={PiCalendarDots}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  onFocus={() => setDate('')}
                />
              </Field>

              <Button
                type="button"
                onClick={fetchSale}
                disabled={searching}
                className="bg-green-600 hover:bg-green-700 h-10 px-6 gap-2"
              >
                {searching ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Search size={18} />
                )}
                <span>Buscar</span>
              </Button>
            </div>
          </Section>

          <Section>
            {sale.length === 0 ? (
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
                  Nenhuma oferta pesquisada
                </h3>
                <p className="text-sm text-slate-500 text-center max-w-[280px]">
                  Informe a <strong>unidade</strong> e a <strong>data</strong>{' '}
                  acima para buscar os produtos em oferta no ERP.
                </p>

                {/* Badge opcional para indicar status */}
                <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Search size={14} />
                  Aguardando Consulta
                </div>
              </div>
            ) : (
              <DataTable
                data={sale}
                columns={productColumns}
                rowSelection={selectedPosters}
                onRowSelect={setSelectedPosters}
                enableRowSelection={true}
                showSelectColumn={true}
              />
            )}
          </Section>

          {sale.length > 0 && (
            <Section>
              <div className="flex items-end gap-4 bg-orange-50 p-6 rounded-xl border border-orange-100">
                <Field className="w-64">
                  <Select
                    onValueChange={setCampaignSelected}
                    value={campaignSelected}
                  >
                    <SelectTrigger className="bg-white border-orange-200">
                      <SelectValue placeholder="Selecione a campanha" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Button
                  onClick={handleAutomate}
                  disabled={
                    loading || Object.keys(selectedPosters).length === 0
                  }
                  className="bg-orange-500 hover:bg-orange-600 h-10 px-8 gap-2 shadow-lg shadow-orange-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <CirclePlay size={20} />
                  )}
                  {loading ? 'Processando...' : 'Iniciar Automação'}
                </Button>

                <span className="text-xs text-orange-700 font-medium pb-2">
                  {
                    Object.keys(selectedPosters).filter(
                      id => selectedPosters[id]
                    ).length
                  }{' '}
                  itens selecionados
                </span>
              </div>
            </Section>
          )}
        </Content>
      </Container>
    </Layout>
  )
}
