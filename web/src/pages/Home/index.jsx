import { Container, Form, Label, Content, InputWrapper } from './styles'

import { FormatCurrency } from '../../hooks/formatCurrency'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import { InputMask } from '../../components/InputMask'
import { Section } from '../../components/Section'

import { useEffect, useState } from 'react'

import { api, apiERP } from '../../services/api'
import { Nav } from '../../components/Nav'
import { PiCalendarDots, PiMagnifyingGlass } from 'react-icons/pi'

import { useCreatedPoster } from '../../hooks/createdPoster'

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PosterView } from '../../components/PosterView'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import { useAuth } from '../../hooks/auth'

export function Home() {
  const [priceClass, setPriceClass] = useState('')
  const [price, setPrice] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')

  const [campaignsType, setCampaignsType] = useState([])
  const [campaignTypeSelected, setCampaignTypeSelected] = useState(0)
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [urlImageCampaigns, setUrlImageCampaigns] = useState('')

  const [product, setProduct] = useState({ id: '' })

  const [dateInitial, setDateInitial] = useState('')
  const [dateFinal, setDateFinally] = useState('')

  const [userUnit, setUserUnit] = useState(null)
  const { user } = useAuth()

  const handleCreatePoster = useCreatedPoster()

  //Objeto onde armazena os valores de todos os inputs
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

  //Essa função retorna as alterações dos valores de name e o value dos inputs, para ser usando dentro do componente PosterView
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

  //Obtem o preço Inteiro e Decimal do campo price
  function handlePriceChange(value) {
    const [priceInteger, priceDecimal = ''] = value.split(',')
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price: value,
      priceInteger,
      priceDecimal: priceDecimal ? `,${priceDecimal}` : ''
    }))
  }

  // Função para atualizar o preço de varejo
  function handleRetailPriceChange(value) {
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price_retail: value
    }))
  }

  // Função para atualizar o preço de atacado
  function handleWholesalePriceChange(value) {
    setProductInputs(prevInputs => ({
      ...prevInputs,
      price_wholesale: value
    }))
  }

  //Essa função limpa, converte e formata o input price para ser usado na função
  //handlePriceChange para separar os valores dicimal e inteiro
  function handleInputChange(event) {
    const { name } = event.target
    const inputValue = event.target.value.replace(/[^\d]/g, '')
    const numericValue = parseFloat(inputValue) / 100
    const formattedValue = isNaN(numericValue)
      ? ''
      : FormatCurrency(numericValue)

    // Verifica qual campo está sendo alterado
    if (name === 'retailPrice' || name === 'priceVarejo') {
      setRetailPrice(formattedValue)
      handleRetailPriceChange(formattedValue.replace('R$', '').trim())
    } else if (name === 'wholesalePrice' || name === 'priceAtacado') {
      setWholesalePrice(formattedValue)
      handleWholesalePriceChange(formattedValue.replace('R$', '').trim())
    } else {
      // Campo de preço normal
      setPrice(formattedValue)
      setRetailPrice(formattedValue)
      setWholesalePrice(formattedValue)
      handlePriceChange(formattedValue.replace('R$', '').trim())

      // Se não estiver no modo atacarejo, o preço normal também é o preço de varejo
      if (campaignTypeSelected !== '2') {
        handleRetailPriceChange(formattedValue.replace('R$', '').trim())
      }
    }

    calculatePriceClass(formattedValue.replace('R$', '').trim())
  }

  //Função que verifica quantos caracteres tem o campo Preço e ajusta o estilo conforme o tamanho
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
      const response = await api.get('campaigns-type')
      setCampaignsType(response.data)
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

  useEffect(() => {
    async function fetchCampaign() {
      const response = await api.get('campaigns')
      setCampaigns(response.data)
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

    setProductInputs(prevInputs => ({
      ...prevInputs,
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
      final_date: ''
    }))
  }

  //Função que verifica e valida se os campos estão preenchidos
  function validateInputs(
    productInputs,
    // dateInitial,
    // dateFinal,
    campaignSelected,
    campaignTypeSelected
  ) {
    // Função auxiliar para verificar se um campo é válido
    const isFieldValid = field => {
      // Se for undefined ou null, é inválido
      if (field === undefined || field === null) return false

      // Se for string, verifica se não está vazia após trim
      if (typeof field === 'string') return field.trim() !== ''

      // Se for número, é válido (mesmo se for 0)
      if (typeof field === 'number') return true

      // Para outros tipos, considera válido se for "truthy"
      return Boolean(field)
    }

    // Cria um objeto com cada campo e seu status de validação
    const fieldValidation = {
      product_id: isFieldValid(productInputs.product_id),
      description: isFieldValid(productInputs.description),
      packaging: isFieldValid(productInputs.packaging),
      // dateInitial: isFieldValid(dateInitial),
      // dateFinal: isFieldValid(dateFinal),
      campaignSelected: isFieldValid(campaignSelected),
      campaignTypeSelected: isFieldValid(campaignTypeSelected)
    }

    // Adiciona validação específica baseada no tipo de campanha
    if (campaignTypeSelected === '2') {
      // Modo atacarejo - verifica preços de varejo e atacado
      fieldValidation.price_retail = isFieldValid(productInputs.price_retail)
      fieldValidation.price_wholesale = isFieldValid(
        productInputs.price_wholesale
      )
    } else {
      // Modo normal - verifica apenas o preço normal
      fieldValidation.price = isFieldValid(productInputs.price)
    }

    // Todos os campos devem ser válidos
    return Object.values(fieldValidation).every(Boolean)
  }

  function createPoster() {
    if (campaignTypeSelected === '2') {
      if (!productInputs.price_retail || !productInputs.price_wholesale) {
        return toastInfo('Os preços de varejo e atacado são obrigatórios!')
      }
    } else {
      if (!productInputs.price) {
        return toastInfo('O preço é obrigatório!')
      }
    }

    const isInputValid = validateInputs(
      productInputs,
      // dateInitial,
      // dateFinal,
      campaignSelected,
      campaignTypeSelected
    )

    if (!isInputValid) {
      toastInfo('Todos os campos são obrigatórios!')
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
      toastSuccess('Cartaz Criado com sucesso!')
      clearInputs()
    }
  }

  async function handleProduct() {
    if (!product.id) {
      return toastInfo('Digite um produto para buscar.')
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
        complement: productInfo.prod_complemento || productInfo.complemento,
        packaging: productInfo.prod_emb || productInfo.embalagem,
        price: '',
        price_retail: '',
        price_wholesale: '',
        priceInteger: '',
        priceDecimal: '',
        fator_atacado: productInfo.fator_atacado || ''
      }

      // Preço normal
      const precoNormal = parseFloat(productInfo.prvenda)
      if (!isNaN(precoNormal)) {
        const precoFormatado = FormatCurrency(precoNormal)
        const precoLimpo = precoFormatado.replace('R$', '').trim()

        setPrice(precoFormatado)
        productData.price = precoLimpo

        // Atualizar priceInteger e priceDecimal
        const [priceInteger, priceDecimal = ''] = precoLimpo.split(',')
        productData.priceInteger = priceInteger
        productData.priceDecimal = priceDecimal ? `,${priceDecimal}` : ''

        calculatePriceClass(precoLimpo)
      }

      // Se for atacarejo
      if (campaignTypeSelected === '2') {
        // Preço de varejo
        if (!isNaN(precoNormal)) {
          const precoVarejoFormatado = FormatCurrency(precoNormal)
          const precoVarejoLimpo = precoVarejoFormatado.replace('R$', '').trim()

          setRetailPrice(precoVarejoFormatado)
          productData.price_retail = precoVarejoLimpo
        }

        // Preço de atacado
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
        // Para campanhas normais, definir os preços de varejo e atacado iguais ao preço normal
        productData.price_retail = productData.price
        productData.price_wholesale = productData.price
        setRetailPrice(price)
        setWholesalePrice(price)
      }
      // Atualizar o estado productInputs com todos os dados
      setProductInputs(productData)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      toastError(`Produto ${product.id} não encontrado.`)
    }
  }

  async function handleImageCampaign(imageCampaignSelected) {
    try {
      const imageCampaign = `${api.defaults.baseURL}/tmp/uploads/${imageCampaignSelected}`
      setUrlImageCampaigns(imageCampaign)
    } catch {
      return toastError('Erro ao buscar a imagem.')
    }
  }

  function handleSelectedChange(value) {
    setCampaignSelected(value) //
  }

  function handleTypeSelectedChange(value) {
    setCampaignTypeSelected(value)
  }

  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Form>
          <Section title="Layout do Cartaz">
            <InputWrapper>
              <Label>Tipo de Campanha</Label>
              <Select onChangeType={handleTypeSelectedChange}>
                <option value={0}>Selecione</option>
                {campaignsType.map(campaignType => (
                  <option
                    key={campaignType.id}
                    value={campaignType.id}
                    id={campaignType.id}
                  >
                    {campaignType.name}
                  </option>
                ))}
              </Select>
            </InputWrapper>

            <InputWrapper>
              <Label>Campanha</Label>
              <Select
                onChangeImage={handleImageCampaign}
                onChangeId={handleSelectedChange}
              >
                <option value={0}>Selecione</option>
                {campaigns.map(campaign => (
                  <option
                    key={campaign.id}
                    value={campaign.id}
                    data-image={campaign.image}
                    id={campaign.id}
                  >
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </InputWrapper>
          </Section>

          <Section title="Informações do Produto">
            {campaignTypeSelected !== '1' ? (
              <>
                <InputWrapper style={{ width: '100%' }}>
                  <Label>Código do Produto</Label>
                  <Input
                    type="number"
                    onChange={e =>
                      setProduct({ ...product, id: e.target.value })
                    }
                    icon={PiMagnifyingGlass}
                    name="product_id"
                    id="product_id"
                    value={product.id ?? ''}
                    onEnter={handleProduct}
                  />
                </InputWrapper>
              </>
            ) : (
              <>
                <InputWrapper>
                  <Label>Código do Produto</Label>
                  <Input
                    type="number"
                    onChange={e =>
                      setProduct({ ...product, id: e.target.value })
                    }
                    icon={PiMagnifyingGlass}
                    name="product_id"
                    id="product_id"
                    value={product.id ?? ''}
                    onEnter={handleProduct}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Preço de Venda</Label>
                  <Input
                    name="price"
                    value={price}
                    maxLength={11}
                    onChange={handleInputChange}
                    id="price"
                  />
                </InputWrapper>
              </>
            )}

            <InputWrapper>
              <Label>Descrição Principal</Label>
              <Textarea
                name="description"
                value={productInputs.description}
                maxLength={30}
                onChange={handleProductInputChange}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Complemento</Label>
              <Textarea
                name="complement"
                value={productInputs.complement}
                maxLength={19}
                onChange={handleProductInputChange}
              />
            </InputWrapper>
          </Section>

          {campaignTypeSelected === '2' && (
            <Section title="Atacarejo">
              <InputWrapper>
                <Label>Preço de Atacado</Label>
                <Input
                  name="wholesalePrice"
                  value={wholesalePrice}
                  maxLength={11}
                  onChange={handleInputChange}
                  id="wholesalePrice"
                />
              </InputWrapper>
              <InputWrapper>
                <Label>Preço de Varejo</Label>
                <Input
                  name="retailPrice"
                  value={retailPrice}
                  maxLength={11}
                  onChange={handleInputChange}
                  id="retailPrice"
                />
              </InputWrapper>
            </Section>
          )}
          {campaignSelected !== '17' && campaignSelected !== '33' && (
            <Section
              title={
                campaignSelected === '18'
                  ? 'Validade do Produto'
                  : 'Validade do Campanha'
              }
            >
              {campaignSelected !== '18' && (
                <InputWrapper>
                  <Label>Data Inicial</Label>
                  <InputMask
                    mask="00/00/0000"
                    placeholder="00/00/0000"
                    type="text"
                    onChange={handleProductInputChange}
                    name="initial_date"
                    icon={PiCalendarDots}
                    value={dateInitial || ''}
                  />
                </InputWrapper>
              )}

              <InputWrapper>
                <Label>Data Final</Label>
                <InputMask
                  type="text"
                  onChange={handleProductInputChange}
                  name="final_date"
                  mask="00/00/0000"
                  placeholder="00/00/0000"
                  icon={PiCalendarDots}
                  value={dateFinal || ''}
                />
              </InputWrapper>
            </Section>
          )}
          <Section>
            <Button title="Criar Cartaz" color="GREEN" onClick={createPoster} />
          </Section>
        </Form>

        {urlImageCampaigns && (
          <PosterView
            imageCampaign={urlImageCampaigns}
            product={productInputs}
            priceClass={priceClass}
            campaignType={campaignTypeSelected}
            campaignSelected={campaignSelected}
          />
        )}
      </Content>

      <Footer />
    </Container>
  )
}
