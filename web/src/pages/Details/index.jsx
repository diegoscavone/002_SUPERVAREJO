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

import { useUpdatePoster } from '../../hooks/updatePoster'

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PosterView } from '../../components/PosterView'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

export function Details() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [priceClass, setPriceClass] = useState('')
  const [price, setPrice] = useState('')

  const [campaignsType, setCampaignsType] = useState([])
  const [campaignTypeSelected, setCampaignTypeSelected] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
  const [urlImageCampaigns, setUrlImageCampaigns] = useState('')

  const [product, setProduct] = useState({})

  const [dateInitial, setDateInitial] = useState('')
  const [dateFinal, setDateFinally] = useState('')

  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')

  const handleUpdatePoster = useUpdatePoster()

  //Objeto onde armazena os valores de todos os inputs
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await api.get(`/posters/${id}`)
        setProduct(response.data)
        setPrice(response.data.price)
        setCampaignTypeSelected(response.data.campaign_type_id)
        setCampaignSelected(response.data.campaign_id)

        // Preencher os inputs com os dados do produto
        const productData = {
          product_id: response.data.product_id,
          description: response.data.description,
          complement: response.data.complement,
          price: response.data.price,
          price_retail: response.data.price_retail || response.data.price, // Fallback para price se não existir
          price_wholesale: response.data.price_wholesale || response.data.price, // Fallback para price se não existir
          priceInteger: '',
          priceDecimal: '',
          packaging: response.data.packaging,
          status: response.data.status,
          fator_atacado: response.data.fator_atacado || ''
        }

        setProductInputs(productData)

        // Definir os preços nos estados também
        if (response.data.price_retail) {
          const retailFormatted = FormatCurrency(
            parseFloat(response.data.price_retail)
          )
          setRetailPrice(retailFormatted)
        }

        if (response.data.price_wholesale) {
          const wholesaleFormatted = FormatCurrency(
            parseFloat(response.data.price_wholesale)
          )
          setWholesalePrice(wholesaleFormatted)
        }

        // Verificar se as datas existem antes de formatar
        if (response.data.initial_date) {
          const formattedInitialDate = format(
            parseISO(response.data.initial_date),
            'dd/MM/yyyy'
          )
          setDateInitial(formattedInitialDate)
        }

        if (response.data.final_date) {
          const formattedFinalDate = format(
            parseISO(response.data.final_date),
            'dd/MM/yyyy'
          )
          setDateFinally(formattedFinalDate)
        }

        handlePriceChange(response.data.price)
        calculatePriceClass(response.data.price)
      } catch (error) {
        console.error('Erro ao buscar produto:', error)
      }
    }
    fetchProduct()
  }, [])

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
    const formattedPrice = FormatCurrency(
      parseFloat(value.replace('R$', '').trim())
    ) // Formata o preço

    setProductInputs(prevInputs => ({
      ...prevInputs,
      price: value,
      priceInteger,
      priceDecimal: priceDecimal ? `,${priceDecimal}` : '',
      formattedPrice // Adiciona o preço formatado aqui
    }))
  }

  //Essa função limpa, converte e formata o input price para ser usado na função
  //handlePriceChange para separar os valores dicimal e inteiro
  // function handleInputChange(event) {
  //   const inputValue = event.target.value.replace(/[^\d]/g, '')
  //   const numericValue = parseFloat(inputValue) / 100
  //   const formattedValue = isNaN(numericValue)
  //     ? ''
  //     : FormatCurrency(numericValue)
  //   setPrice(formattedValue)
  //   handlePriceChange(formattedValue.replace('R$', '').trim())
  //   calculatePriceClass(formattedValue.replace('R$', '').trim())
  // }

  function handleInputChange(event) {
    const { name, value } = event.target
    const inputValue = value.replace(/[^\d]/g, '')

    let formattedValue = ''
    if (inputValue) {
      const numericValue = parseFloat(inputValue) / 100
      formattedValue = FormatCurrency(numericValue)
    }

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

      if (String(campaignTypeSelected) !== '2') {
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
    async function fetchCampaign() {
      const response = await api.get('campaigns')
      setCampaigns(response.data)
    }
    fetchCampaign()
  }, [])

  useEffect(() => {
    if (campaignSelected) {
      const selectedCampaign = campaigns.find(
        campaign => campaign.id === campaignSelected
      )
      if (selectedCampaign) {
        handleImageCampaign(selectedCampaign.image)
      }
    }
  }, [campaignSelected, campaigns])

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
  // function validateInputs(
  //   productInputs,
  //   // dateInitial,
  //   // dateFinal,
  //   campaignSelected,
  //   campaignTypeSelected
  // ) {
  //   const requiredFiels = [
  //     productInputs.product_id,
  //     productInputs.description,
  //     productInputs.packaging,
  //     productInputs.price,
  //     // dateInitial,
  //     // dateFinal,
  //     campaignSelected,
  //     campaignTypeSelected
  //   ]
  //   return requiredFiels.every(field => {
  //     return field && (typeof field === 'string' ? field.trim() !== '' : true)
  //   })
  // }

  function validateInputs(
    productInputs,
    campaignSelected,
    campaignTypeSelected
  ) {
    // Função auxiliar para verificar se um campo é válido
    const isFieldValid = field => {
      if (field === undefined || field === null) return false
      if (typeof field === 'string') return field.trim() !== ''
      if (typeof field === 'number') return true
      return Boolean(field)
    }

    // Cria um objeto com cada campo e seu status de validação
    const fieldValidation = {
      product_id: isFieldValid(productInputs.product_id),
      description: isFieldValid(productInputs.description),
      packaging: isFieldValid(productInputs.packaging),
      campaignSelected: isFieldValid(campaignSelected),
      campaignTypeSelected: isFieldValid(campaignTypeSelected)
    }

    // Adiciona validação específica baseada no tipo de campanha
    if (String(campaignTypeSelected) === '2') {
      fieldValidation.price_retail = isFieldValid(productInputs.price_retail)
      fieldValidation.price_wholesale = isFieldValid(
        productInputs.price_wholesale
      )
    } else {
      fieldValidation.price = isFieldValid(productInputs.price)
    }

    // Todos os campos devem ser válidos
    return Object.values(fieldValidation).every(Boolean)
  }

  // async function updatePoster() {
  //   const isInputValid = validateInputs(
  //     productInputs,
  //     // dateInitial,
  //     // dateFinal,
  //     campaignSelected,
  //     campaignTypeSelected
  //   )
  //   if (!isInputValid) {
  //     toastInfo('Todos os campos são obrigatórios!')
  //   } else {
  //     await handleUpdatePoster(
  //       id,
  //       productInputs,
  //       dateInitial,
  //       dateFinal,
  //       campaignSelected,
  //       campaignTypeSelected
  //     )
  //     toastSuccess('Cartaz alterado com sucesso!')
  //     clearInputs()
  //     setTimeout(() => {
  //       navigate('/print')
  //     }, 2000)
  //   }
  // }

  async function updatePoster() {
    if (String(campaignTypeSelected) === '2') {
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
      campaignSelected,
      campaignTypeSelected
    )

    if (!isInputValid) {
      toastInfo('Todos os campos são obrigatórios!')
    } else {
      let posterData = { ...productInputs }
      if (String(campaignTypeSelected) === '2') {
        posterData.price = posterData.price_retail
      } else {
        posterData.price_retail = posterData.price
        posterData.price_wholesale = posterData.price
      }

      await handleUpdatePoster(
        id,
        posterData,
        dateInitial || null,
        dateFinal || null,
        campaignSelected,
        campaignTypeSelected
      )
      toastSuccess('Cartaz alterado com sucesso!')
      clearInputs()
      setTimeout(() => {
        navigate('/print')
      }, 2000)
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
    setCampaignSelected(value)
    const selectedCampaign = campaigns.find(campaign => campaign.id === value)
    if (selectedCampaign) {
      handleImageCampaign(selectedCampaign.image)
    }
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
              <Select
                onChangeType={handleTypeSelectedChange}
                value={campaignTypeSelected}
              >
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
                value={campaignSelected}
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
            {String(campaignTypeSelected) !== '1' ? (
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
                    value={productInputs.product_id}
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
                    value={productInputs.product_id}
                  />
                </InputWrapper>

                <InputWrapper>
                  <Label>Preço de Venda</Label>
                  <Input
                    name="price"
                    value={productInputs.price}
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

          {String(campaignTypeSelected) === '2' && (
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

          {/* <Section title="Validade da Campanha">
            <InputWrapper>
              <Label>Data Inicial</Label>
              <InputMask
                mask="00/00/0000"
                placeholder="00/00/0000"
                type="text"
                onChange={handleProductInputChange}
                name="initial_date"
                icon={PiCalendarDots}
                value={dateInitial}
              />
            </InputWrapper>

            <InputWrapper>
              <Label>Data Final</Label>
              <InputMask
                type="text"
                onChange={handleProductInputChange}
                name="final_date"
                mask="00/00/0000"
                placeholder="00/00/0000"
                icon={PiCalendarDots}
                value={dateFinal}
              />
            </InputWrapper>
          </Section> */}

          {String(campaignSelected) !== '17' &&
            String(campaignSelected) !== '33' && (
              <Section
                title={
                  String(campaignSelected) === '18'
                    ? 'Validade do Produto'
                    : 'Validade da Campanha'
                }
              >
                {String(campaignSelected) !== '18' && (
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
            <Button
              title="Salvar Cartaz"
              color="GREEN"
              onClick={updatePoster}
            />
          </Section>
        </Form>

        {urlImageCampaigns && (
          <PosterView
            imageCampaign={urlImageCampaigns}
            product={{
              ...productInputs,
              price:
                String(campaignTypeSelected) !== '2'
                  ? productInputs.formattedPrice || productInputs.price
                  : productInputs.price,
              price_retail: productInputs.price_retail,
              price_wholesale: productInputs.price_wholesale,
              initial_date: dateInitial,
              final_date: dateFinal,
              fator_atacado: productInputs.fator_atacado
            }}
            priceClass={priceClass}
            campaignType={String(campaignTypeSelected)}
            campaignSelected={String(campaignSelected)}
          />
        )}
      </Content>

      <Footer />
    </Container>
  )
}
