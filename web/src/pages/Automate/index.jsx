import {
  CirclePlay,
  FileImage,
  Loader2,
  Plus,
  Search,
  Sparkles
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useCreatedPoster } from '../../hooks/createdPoster'
import { api, apiERP } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import { Button } from '@/components/Button'
import { InputCustom } from '@/components/InputCustom'
import { Layout } from '@/components/Layout'
import { SelectCustom } from '@/components/SelectCustom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '../../components/DataTable'
import { InputMask } from '../../components/InputMask'

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

  // Formatação de data no padrão brasileiro
  const formatDate = useCallback(dateString => {
    if (!dateString) return '-'
    const onlyDate = dateString.split('T')[0]
    const parts = onlyDate.split('-')
    if (parts.length !== 3) return dateString
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  }, [])

  // Definição das colunas memoizadas para o DataTable
  const productColumns = useMemo(
    () => [
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
    ],
    [formatDate]
  )

  // Carrega campanhas no mount
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await api.get('campaigns')
        setCampaigns(response.data || [])
      } catch (error) {
        console.error('Erro ao buscar campanhas:', error)
      }
    }
    fetchCampaigns()
  }, [])

  // Busca ofertas no ERP
  async function fetchSale() {
    if (!unit || !date) {
      return toastInfo('Unidade e Data Inicial são obrigatórios.')
    }

    try {
      setSearching(true)
      const response = await apiERP.get(`/posters?unit=${unit}&date=${date}`)

      if (!response.data || response.data.length === 0) {
        toastInfo('Nenhuma oferta encontrada com a data e unidade informadas.')
        setSale([])
        setSelectedPosters({})
        return
      }

      const formattedData = response.data.map(item => ({
        id: String(item.prod_codigo),
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
      setSelectedPosters({})
    } catch {
      toastError('Não foi possível encontrar os produtos em oferta.')
    } finally {
      setSearching(false)
    }
  }

  // Submissão dos cartazes em lote
  async function handleAutomate() {
    const selectedIds = Object.keys(selectedPosters).filter(
      id => selectedPosters[id]
    )

    if (selectedIds.length === 0 || !campaignSelected) {
      return toastInfo('Selecione pelo menos um produto e uma campanha.')
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
      setTimeout(() => navigate('/print'), 1500)
    } catch (error) {
      toastError('Erro ao cadastrar cartazes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedCount = Object.keys(selectedPosters).filter(
    id => selectedPosters[id]
  ).length

  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {/* Painel de Filtros de Consulta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-none">
          <div>
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-green-600" />
              <h1 className="text-xl sm:text-xl font-bold tracking-tight text-green-600">
                Automação
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Crie de forma automática os cartazes das promoções vigentes na empresa.
            </p>
          </div>

        </div>
        <Card className="border border-slate-200 shadow-none">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              {/* Unidade */}
              <div className="sm:col-span-3 lg:col-span-2">
                <InputCustom
                  label="Unidade"
                  placeholder="000"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                />
              </div>

              {/* Data Inicial */}
              <div className="sm:col-span-5 lg:col-span-3">
                <InputMask
                  label="Data da Oferta"
                  mask="00/00/0000"
                  placeholder="dd/mm/aaaa"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  onFocus={() => setDate('')}
                />
              </div>

              {/* Botão Buscar */}
              <div className="sm:col-span-4 lg:col-span-2">
                <Button
                  type="button"
                  color="green"
                  onClick={fetchSale}
                  disabled={searching}
                >
                  {searching ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span>{searching ? 'Buscando...' : 'Buscar Ofertas'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listagem / Tabela de Produtos */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2 sm:p-4">
          {sale.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] w-full p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-xs mb-3">
                <Search className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
              </div>

              <h3 className="text-base font-semibold text-slate-800">
                Nenhuma oferta pesquisada
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                Informe a <strong>unidade</strong> e a{' '}
                <strong>data inicial</strong> acima para carregar as ofertas
                vigentes no ERP.
              </p>

              <Badge
                variant="secondary"
                className="mt-4 gap-1.5 px-3 py-1 font-semibold text-[11px] uppercase tracking-wider text-slate-500 bg-slate-100"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                Aguardando Consulta
              </Badge>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable
                data={sale}
                columns={productColumns}
                rowSelection={selectedPosters}
                onRowSelect={setSelectedPosters}
                enableRowSelection={true}
                showSelectColumn={true}
                defaultPageSize={80}
              />
            </div>
          )}
        </section>

        {/* Barra Flutuante de Ação (Aparece quando houver ofertas carregadas) */}
        {sale.length > 0 && (
          <div className="sticky bottom-6 z-30 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-200 px-2 sm:px-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-zinc-900 text-zinc-100 dark:bg-zinc-950 p-3 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-white/10 w-full sm:w-auto backdrop-blur-md">
              {/* Badge de Seleção */}
              <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 px-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-zinc-200">
                  <strong className="text-white font-semibold">
                    {selectedCount}
                  </strong>{' '}
                  {selectedCount === 1
                    ? 'item selecionado'
                    : 'itens selecionados'}
                </span>
              </div>

              <div className="h-4 w-px bg-zinc-800 hidden sm:block shrink-0" />

              {/* Select de Campanha */}
              <div className="w-full sm:w-64">
                <SelectCustom
                  id="campaign_automate_select"
                  placeholder="Selecione a campanha"
                  value={campaignSelected}
                  onValueChange={setCampaignSelected}
                  containerClassName="w-full sm:w-64"
                  className="h-9 bg-zinc-800/80 border-zinc-700 text-xs text-zinc-100 rounded-xl focus:border-emerald-500 shadow-none"
                >
                  {campaigns.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </SelectCustom>
              </div>

              {/* Botão Disparar Automação */}
              <Button
                type="button"
                onClick={handleAutomate}
                disabled={loading || selectedCount === 0 || !campaignSelected}
                className="w-full sm:w-auto h-9 text-xs font-semibold px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-none gap-2 shrink-0 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <CirclePlay className="h-4 w-4" />
                    <span>Iniciar Automação</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
