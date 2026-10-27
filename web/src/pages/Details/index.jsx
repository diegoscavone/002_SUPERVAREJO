import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  CalendarDays,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  Loader2,
  Barcode
} from 'lucide-react'

import { api } from '../../services/api'
import { useUpdatePoster } from '../../hooks/updatePoster'
import { FormatCurrency } from '../../hooks/formatCurrency'
import { toastError, toastSuccess } from '../../styles/toastConfig'

// Componentes da Aplicação
import { Layout } from '../../components/Layout'
import { Section } from '../../components/Section'
import { PosterView } from '../../components/PosterView'
import { InputMask } from '../../components/InputMask'
import { InputCustom } from '@/components/InputCustom'
import { TextareaCustom } from '@/components/TextareaCustom'
import { SelectCustom } from '@/components/SelectCustom'
import { Button } from '@/components/Button'
import { Label } from '@/components/ui/label'

export function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const handleUpdatePoster = useUpdatePoster()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [priceClass, setPriceClass] = useState('')
  const [price, setPrice] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')

  const [campaignsType, setCampaignsType] = useState([])
  const [campaignTypeSelected, setCampaignTypeSelected] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [selectedCampaignData, setSelectedCampaignData] = useState(null)
  const [urlImageCampaigns, setUrlImageCampaigns] = useState('')

  const [dateInitial, setDateInitial] = useState('')
  const [dateFinal, setDateFinally] = useState('')

  const [productInputs, setProductInputs] = useState({
    product_id: '',
    description: '',
    complement: '',
    price: '',
    price_retail: '',
    price_wholesale: '',
    priceInteger: '',
    priceDecimal: '',
    packaging: '',
    initial_date: '',
    final_date: '',
    fator_atacado: ''
  })

  function calculatePriceClass(priceInteger) {
    if (!priceInteger) return
    const str = String(priceInteger)
    if (str.length <= 4) setPriceClass('small-price')
    else if (str.length === 5) setPriceClass('medium-price')
    else if (str.length === 6) setPriceClass('large-price')
    else setPriceClass('x-large-price')
  }

  // 1. Carregamento dos dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [resTypes, resCamps, resPoster] = await Promise.all([
          api.get('campaigns-type'),
          api.get('campaigns'),
          api.get(`/posters/${id}`)
        ])

        const formattedCampaigns = (resCamps.data || []).map(camp => ({
          ...camp,
          imageUrl: camp.image
            ? `${api.defaults.baseURL}/tmp/uploads/${camp.image}`
            : ''
        }))

        setCampaignsType(resTypes.data || [])
        setCampaigns(formattedCampaigns)

        const poster = resPoster.data

        // Formatação de Datas
        const dInitial = poster.initial_date
          ? format(parseISO(poster.initial_date), 'dd/MM/yyyy')
          : ''
        const dFinal = poster.final_date
          ? format(parseISO(poster.final_date), 'dd/MM/yyyy')
          : ''

        // Preço Inteiro/Decimal para PosterView
        const [pInt, pDec] = String(poster.price || '').split(',')

        setProductInputs({
          product_id: poster.product_id,
          description: poster.description,
          complement: poster.complement || '',
          packaging: poster.packaging || '',
          price: poster.price,
          price_retail: poster.price_retail || poster.price,
          price_wholesale: poster.price_wholesale || poster.price,
          initial_date: dInitial,
          final_date: dFinal,
          fator_atacado: poster.fator_atacado || '',
          priceInteger: pInt,
          priceDecimal: pDec ? `,${pDec}` : ''
        })

        // Sincroniza estados de exibição
        setPrice(poster.price ? `R$ ${poster.price}` : '')
        setRetailPrice(poster.price_retail ? `R$ ${poster.price_retail}` : (poster.price ? `R$ ${poster.price}` : ''))
        setWholesalePrice(poster.price_wholesale ? `R$ ${poster.price_wholesale}` : (poster.price ? `R$ ${poster.price}` : ''))
        setDateInitial(dInitial)
        setDateFinally(dFinal)
        setCampaignTypeSelected(String(poster.campaign_type_id || ''))
        setCampaignSelected(String(poster.campaign_id || ''))

        calculatePriceClass(String(poster.price || ''))

        // Identifica e sincroniza os dados da campanha ativa
        const currentCamp = formattedCampaigns.find(
          c => String(c.id) === String(poster.campaign_id)
        )
        if (currentCamp) {
          setSelectedCampaignData(currentCamp)
          setUrlImageCampaigns(currentCamp.imageUrl)
        }
      } catch (error) {
        toastError('Erro ao carregar dados do cartaz.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  function handleProductInputChange(event) {
    const { name, value } = event.target
    setProductInputs(prev => ({ ...prev, [name]: value }))
    if (name === 'initial_date') setDateInitial(value)
    else if (name === 'final_date') setDateFinally(value)
  }

  function handleInputChange(event) {
    const { name } = event.target
    const inputValue = event.target.value.replace(/[^\d]/g, '')
    const numericValue = parseFloat(inputValue) / 100
    const formattedValue = isNaN(numericValue) ? '' : FormatCurrency(numericValue)
    const cleanValue = formattedValue.replace('R$', '').trim()

    if (name === 'retailPrice') {
      setRetailPrice(formattedValue)
      setProductInputs(prev => ({ ...prev, price_retail: cleanValue }))
    } else if (name === 'wholesalePrice') {
      setWholesalePrice(formattedValue)
      setProductInputs(prev => ({ ...prev, price_wholesale: cleanValue }))
    } else {
      setPrice(formattedValue)
      const [pInt, pDec] = cleanValue.split(',')
      setProductInputs(prev => ({
        ...prev,
        price: cleanValue,
        priceInteger: pInt,
        priceDecimal: pDec ? `,${pDec}` : ''
      }))
    }
    calculatePriceClass(cleanValue)
  }

  function handleSelectCampaign(value) {
    setCampaignSelected(value)
    const selected = campaigns.find(c => String(c.id) === String(value))
    if (selected) {
      setSelectedCampaignData(selected)
      setUrlImageCampaigns(selected.imageUrl)
    } else {
      setSelectedCampaignData(null)
      setUrlImageCampaigns('')
    }
  }

  async function updatePoster() {
    try {
      setSaving(true)
      await handleUpdatePoster(
        id,
        productInputs,
        dateInitial || null,
        dateFinal || null,
        campaignSelected,
        campaignTypeSelected
      )
      toastSuccess('Cartaz atualizado com sucesso!')
      setTimeout(() => navigate('/print'), 1500)
    } catch (error) {
      toastError('Erro ao atualizar cartaz.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Carregando dados para edição...
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        
        {/* Barra superior de navegação */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            color="cancel"
            icon={ArrowLeft}
            label="Voltar"
            onClick={() => navigate('/print')}
            className="h-9 px-4 text-xs font-semibold"
          />
        </div>

        {/* Grid idêntico ao da Home: Form (6 cols) + Preview (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Coluna do Formulário */}
          <form
            onSubmit={e => {
              e.preventDefault()
              updatePoster()
            }}
            className="lg:col-span-6 flex flex-col gap-4 w-full bg-card p-6 rounded-2xl border border-border shadow-sm"
          >
            {/* Seção 1: Seleção de Campanha e Tipo */}
            <Section title="Layout do Cartaz">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Tipo de Campanha */}
                <div className="flex flex-col gap-1.5 w-full">
                  <SelectCustom
                    id="campaign-type"
                    label="Tipo de Campanha"
                    placeholder="Escolha o tipo de campanha"
                    value={campaignTypeSelected || undefined}
                    onChangeType={value => setCampaignTypeSelected(value)}
                  >
                    {campaignsType.map(type => (
                      <option key={type.id} value={String(type.id)}>
                        {type.name}
                      </option>
                    ))}
                  </SelectCustom>
                </div>

                {/* Seleção do Template com Imagem */}
                <div className="flex flex-col gap-1.5 w-full">
                  <SelectCustom
                    id="campaign-select"
                    label="Campanha Promocional"
                    placeholder="Selecione uma campanha"
                    value={campaignSelected}
                    onChangeType={handleSelectCampaign}
                  >
                    {campaigns.map(camp => (
                      <option
                        key={camp.id}
                        id={String(camp.id)}
                        value={String(camp.id)}
                        data-image={camp.imageUrl}
                      >
                        {camp.name}
                      </option>
                    ))}
                  </SelectCustom>
                </div>
              </div>
            </Section>

            {/* Seção 2: Identificação do Produto */}
            <Section title="Informações do Produto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <InputCustom
                  id="product_id"
                  name="product_id"
                  label="Código do Produto"
                  icon={Barcode}
                  value={productInputs.product_id}
                  readOnly
                  className="bg-slate-50 cursor-not-allowed font-mono"
                />

                {campaignTypeSelected !== '2' && (
                  <InputCustom
                    id="price"
                    name="price"
                    label="Preço de Venda"
                    placeholder="R$ 0,00"
                    value={price}
                    onChange={handleInputChange}
                  />
                )}
              </div>

              {/* Descrições para o cartaz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2">
                <div className="flex flex-col gap-1.5">
                  <TextareaCustom
                    label="Descrição Principal"
                    placeholder="Ex: Refrigerante Coca-Cola 2L"
                    value={productInputs.description}
                    maxLength={30}
                    onChange={handleProductInputChange}
                    name="description"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <TextareaCustom
                    label="Complemento"
                    placeholder="Ex: Tipo 1 Pacote"
                    value={productInputs.complement}
                    maxLength={19}
                    onChange={handleProductInputChange}
                    name="complement"
                  />
                </div>
              </div>
            </Section>

            {/* Seção 3: Preços Atacarejo */}
            {campaignTypeSelected === '2' && (
              <Section title="Preços Atacarejo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <InputCustom
                    id="retailPrice"
                    name="retailPrice"
                    label="Preço Varejo"
                    placeholder="R$ 0,00"
                    value={retailPrice}
                    onChange={handleInputChange}
                  />

                  <InputCustom
                    id="wholesalePrice"
                    name="wholesalePrice"
                    label="Preço Atacado"
                    placeholder="R$ 0,00"
                    value={wholesalePrice}
                    onChange={handleInputChange}
                  />
                </div>
              </Section>
            )}

            {/* Seção 4: Validades (Conforme Regras da Campanha) */}
            {selectedCampaignData && !selectedCampaignData.is_price_required ? (
              <Section
                title={
                  selectedCampaignData.is_vencimento
                    ? 'Validade do Produto'
                    : 'Validade da Campanha'
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {!selectedCampaignData.is_vencimento && (
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="initial_date"
                        className="text-sm font-normal text-zinc-700 dark:text-zinc-300"
                      >
                        Data Inicial
                      </Label>
                      <InputMask
                        id="initial_date"
                        name="initial_date"
                        mask="00/00/0000"
                        placeholder="00/00/0000"
                        type="text"
                        value={dateInitial}
                        onChange={handleProductInputChange}
                        icon={CalendarDays}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="final_date"
                      className="text-sm font-normal text-zinc-700 dark:text-zinc-300"
                    >
                      {selectedCampaignData.is_vencimento
                        ? 'Data de Vencimento'
                        : 'Data Final'}
                    </Label>
                    <InputMask
                      id="final_date"
                      name="final_date"
                      mask="00/00/0000"
                      placeholder="00/00/0000"
                      type="text"
                      value={dateFinal}
                      onChange={handleProductInputChange}
                      icon={CalendarDays}
                    />
                  </div>
                </div>
              </Section>
            ) : (
              <Section title="Período de Validade">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="initial_date"
                      className="text-sm font-normal text-zinc-700 dark:text-zinc-300"
                    >
                      Data Inicial
                    </Label>
                    <InputMask
                      id="initial_date"
                      name="initial_date"
                      mask="00/00/0000"
                      placeholder="00/00/0000"
                      type="text"
                      value={dateInitial}
                      onChange={handleProductInputChange}
                      icon={CalendarDays}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="final_date"
                      className="text-sm font-normal text-zinc-700 dark:text-zinc-300"
                    >
                      Data Final
                    </Label>
                    <InputMask
                      id="final_date"
                      name="final_date"
                      mask="00/00/0000"
                      placeholder="00/00/0000"
                      type="text"
                      value={dateFinal}
                      onChange={handleProductInputChange}
                      icon={CalendarDays}
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* Ação de Submissão */}
            <div className="pt-2">
              <Button
                type="submit"
                label="Salvar Alterações"
                color="green"
                icon={Save}
                isLoading={saving}
              />
            </div>
          </form>

          {/* Coluna de Visualização do Cartaz (Sticky) */}
          <aside className="lg:col-span-6 w-full sticky top-6">
            {urlImageCampaigns ? (
              <PosterView
                imageCampaign={urlImageCampaigns}
                product={productInputs}
                priceClass={priceClass}
                campaignType={campaignTypeSelected}
                campaignSelected={campaignSelected}
              />
            ) : (
              <div className="w-full aspect-[1/1.414] rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex flex-col items-center justify-center p-8 text-center transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Pré-visualização do Cartaz
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Selecione um modelo de campanha acima para visualizar o cartaz em tempo real.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  )
}