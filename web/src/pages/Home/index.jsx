import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, apiERP } from '../../services/api'
import { useAuth } from '../../hooks/auth'
import { useCreatedPoster } from '../../hooks/createdPoster'
import { FormatCurrency } from '../../hooks/formatCurrency'

// Componentes da Aplicação
import { Layout } from '../../components/Layout'
import { Section } from '../../components/Section'
import { PosterView } from '../../components/PosterView'
import { InputCustom } from '@/components/InputCustom'
import { InputMask } from '../../components/InputMask'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

// Componentes shadcn/ui
import { Button } from '@/components/Button'
import { TextareaCustom } from '@/components/TextareaCustom'
import { Label } from '@/components/ui/label'
import { SelectCustom } from '@/components/SelectCustom'

// Ícones
import {
  Newspaper,
  Barcode,
  DollarSign,
  CalendarDays,
  Image as ImageIcon,
  Search,
  PlusCircle
} from 'lucide-react'

export function Home() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const [priceClass, setPriceClass] = useState('')
  const [price, setPrice] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')

  const [campaignsType, setCampaignsType] = useState([])
  const [campaignTypeSelected, setCampaignTypeSelected] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [urlImageCampaigns, setUrlImageCampaigns] = useState('')

  const [product, setProduct] = useState({ id: '' })
  const [dateInitial, setDateInitial] = useState('')
  const [dateFinal, setDateFinally] = useState('')
  const [userUnit, setUserUnit] = useState(null)
  const [selectedCampaignData, setSelectedCampaignData] = useState(null)

  const handleCreatePoster = useCreatedPoster()

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
    status: '',
    fator_atacado: ''
  })

  function handleProductInputChange(event) {
    const { name, value } = event.target

    setProductInputs(prevInputs => ({
      ...prevInputs,
      [name]: value
    }))

    if (name === 'initial_date') {
      setDateInitial(value)
    } else if (name === 'final_date') {
      setDateFinally(value)
    }
  }

  function handlePriceChange(value) {
    const [priceInteger, priceDecimal = ''] = value.split(',')
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price: value,
      priceInteger,
      priceDecimal: priceDecimal ? `,${priceDecimal}` : ''
    }))
  }

  function handleRetailPriceChange(value) {
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price_retail: value
    }))
  }

  function handleWholesalePriceChange(value) {
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price_wholesale: value
    }))
  }

  function handleInputChange(event) {
    const { name } = event.target
    const inputValue = event.target.value.replace(/[^\d]/g, '')
    const numericValue = parseFloat(inputValue) / 100
    const formattedValue = isNaN(numericValue)
      ? ''
      : FormatCurrency(numericValue)

    if (name === 'retailPrice' || name === 'priceVarejo') {
      setRetailPrice(formattedValue)
      handleRetailPriceChange(formattedValue.replace('R$', '').trim())
    } else if (name === 'wholesalePrice' || name === 'priceAtacado') {
      setWholesalePrice(formattedValue)
      handleWholesalePriceChange(formattedValue.replace('R$', '').trim())
    } else {
      setPrice(formattedValue)
      setRetailPrice(formattedValue)
      setWholesalePrice(formattedValue)
      handlePriceChange(formattedValue.replace('R$', '').trim())

      if (campaignTypeSelected !== '2') {
        handleRetailPriceChange(formattedValue.replace('R$', '').trim())
      }
    }

    calculatePriceClass(formattedValue.replace('R$', '').trim())
  }

  function calculatePriceClass(priceInteger) {
    if (priceInteger.length <= 4) {
      setPriceClass('small-price')
    } else if (priceInteger.length === 5) {
      setPriceClass('medium-price')
    } else if (priceInteger.length === 6) {
      setPriceClass('large-price')
    } else {
      setPriceClass('x-large-price')
    }
  }

  useEffect(() => {
    async function fetchCampaignType() {
      try {
        const response = await api.get('campaigns-type')
        setCampaignsType(response.data)
      } catch (error) {
        toastError('Erro ao carregar tipos de campanhas.')
      }
    }
    fetchCampaignType()
  }, [])

  useEffect(() => {
    if (user) {
      const unidadeProperty = user.unit || user.unidade || user.unid_codigo
      if (unidadeProperty) {
        setUserUnit(unidadeProperty)
      }
    }
  }, [user])

  // Busca campanhas e já anexa a URL completa da imagem em cada item
  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await api.get('campaigns')
        const formattedCampaigns = response.data.map(campaign => ({
          ...campaign,
          imageUrl: campaign.image
            ? `${api.defaults.baseURL}/tmp/uploads/${campaign.image}`
            : ''
        }))
        setCampaigns(formattedCampaigns)
      } catch (error) {
        toastError('Erro ao carregar campanhas.')
      }
    }
    fetchCampaign()
  }, [])

  function clearInputs() {
    setProduct({ id: '' })
    setDateInitial('')
    setDateFinally('')
    setPrice('')
    setRetailPrice('')
    setWholesalePrice('')

    setProductInputs({
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
      status: '',
      fator_atacado: ''
    })
  }

  function validateInputs(
    productInputs,
    campaignSelected,
    campaignTypeSelected,
    features
  ) {
    const isFieldValid = field => {
      if (field === undefined || field === null) return false
      if (typeof field === 'string') return field.trim() !== ''
      return true
    }

    const fieldValidation = {
      product_id: isFieldValid(productInputs.product_id),
      description: isFieldValid(productInputs.description),
      packaging: isFieldValid(productInputs.packaging),
      campaignSelected:
        isFieldValid(campaignSelected) && campaignSelected !== '0'
    }

    if (features?.is_price_required) {
      if (campaignTypeSelected === '2') {
        fieldValidation.price_retail = isFieldValid(productInputs.price_retail)
        fieldValidation.price_wholesale = isFieldValid(
          productInputs.price_wholesale
        )
      } else {
        fieldValidation.price = isFieldValid(productInputs.price)
      }
    }

    return Object.values(fieldValidation).every(Boolean)
  }

  function createPoster() {
    if (campaignTypeSelected === '2') {
      if (!productInputs.price_retail || !productInputs.price_wholesale) {
        return toastInfo('Os preços de varejo e atacado são obrigatórios!')
      }
    } else {
      if (!productInputs.price && selectedCampaignData?.is_price_required) {
        return toastInfo('O preço é obrigatório!')
      }
    }

    const isInputValid = validateInputs(
      productInputs,
      campaignSelected,
      campaignTypeSelected,
      selectedCampaignData
    )

    if (!isInputValid) {
      toastInfo('Preencha todos os campos obrigatórios do cartaz.')
    } else {
      let posterData = { ...productInputs }
      if (campaignTypeSelected === '2') {
        posterData.price = posterData.price_retail
      } else {
        posterData.price_retail = posterData.price
        posterData.price_wholesale = posterData.price
      }

      handleCreatePoster(
        posterData,
        dateInitial || null,
        dateFinal || null,
        campaignSelected,
        campaignTypeSelected
      )
      toastSuccess('Cartaz criado com sucesso!')
      clearInputs()
    }
  }

  async function handleProduct() {
    if (!product.id) {
      return toastInfo('Digite ou escaneie o código do produto.')
    }

    try {
      const response = await apiERP.get(`/products/${product.id}`, {
        params: {
          campaignType: campaignTypeSelected,
          unit: userUnit
        }
      })

      const productInfo =
        response.data.products && response.data.products.length > 0
          ? response.data.products[0]
          : response.data

      let productData = {
        product_id: productInfo.prod_codigo || productInfo.codigo,
        description: productInfo.prod_descricao || productInfo.descricao,
        complement:
          productInfo.prod_complemento || productInfo.complemento || '',
        packaging: productInfo.prod_emb || productInfo.embalagem || 'UN',
        price: '',
        price_retail: '',
        price_wholesale: '',
        priceInteger: '',
        priceDecimal: '',
        fator_atacado: productInfo.fator_atacado || ''
      }

      const precoNormal = parseFloat(productInfo.prvenda)
      if (!isNaN(precoNormal)) {
        const precoFormatado = FormatCurrency(precoNormal)
        const precoLimpo = precoFormatado.replace('R$', '').trim()

        setPrice(precoFormatado)
        productData.price = precoLimpo

        const [priceInteger, priceDecimal = ''] = precoLimpo.split(',')
        productData.priceInteger = priceInteger
        productData.priceDecimal = priceDecimal ? `,${priceDecimal}` : ''

        calculatePriceClass(precoLimpo)
      }

      if (campaignTypeSelected === '2') {
        if (!isNaN(precoNormal)) {
          const precoVarejoFormatado = FormatCurrency(precoNormal)
          const precoVarejoLimpo = precoVarejoFormatado.replace('R$', '').trim()
          setRetailPrice(precoVarejoFormatado)
          productData.price_retail = precoVarejoLimpo
        }

        const precoAtacado = parseFloat(productInfo.preco_atacado)
        if (!isNaN(precoAtacado)) {
          const precoAtacadoFormatado = FormatCurrency(precoAtacado)
          const precoAtacadoLimpo = precoAtacadoFormatado
            .replace('R$', '')
            .trim()
          setWholesalePrice(precoAtacadoFormatado)
          productData.price_wholesale = precoAtacadoLimpo
        }
      } else {
        productData.price_retail = productData.price
        productData.price_wholesale = productData.price
        setRetailPrice(price)
        setWholesalePrice(price)
      }

      setProductInputs(productData)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toastError(`Produto ${product.id} não encontrado no ERP.`)
    }
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

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          <form
            onSubmit={e => {
              e.preventDefault()
              createPoster()
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

                {/* Seleção do Template de Campanha com Imagem */}
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
                  label="Código do Produto"
                  placeholder="Digite o código do produto"
                  icon={Search}
                  value={product.id}
                  onChange={e => setProduct({ ...product, id: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleProduct()
                    }
                  }}
                />

                {campaignTypeSelected === '1' && (
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

            {/* Seção 4: Validades */}
            {selectedCampaignData &&
              !selectedCampaignData.is_price_required && (
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
              )}

            {/* Ação de Submissão */}
            <div className="pt-2">
              <Button
                type="button"
                label="Criar Cartaz Promocional"
                color="green"
                icon={PlusCircle}
                onClick={createPoster}
              />
            </div>
          </form>

          {/* Coluna de Visualização do Cartaz */}
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
                  Selecione um modelo de campanha acima para visualizar o cartaz
                  em tempo real.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  )
}
