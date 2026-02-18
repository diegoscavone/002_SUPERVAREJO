import { Container, Content, Form } from './styles'
import { FormatCurrency } from '../../hooks/formatCurrency'
import { InputMask } from '../../components/InputMask'
import { Layout } from '../../components/Layout'
import { Section } from '../../components/Section'
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useUpdatePoster } from '../../hooks/updatePoster'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { PosterView } from '../../components/PosterView'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CalendarDays, Save, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const handleUpdatePoster = useUpdatePoster()

  const [priceClass, setPriceClass] = useState('')
  const [price, setPrice] = useState('')
  const [retailPrice, setRetailPrice] = useState('')
  const [wholesalePrice, setWholesalePrice] = useState('')

  const [campaignsType, setCampaignsType] = useState([])
  const [campaignTypeSelected, setCampaignTypeSelected] = useState('')
  const [campaigns, setCampaigns] = useState([])
  const [campaignSelected, setCampaignSelected] = useState('')
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

  // 1. CARREGAMENTO DOS DADOS INICIAIS (POSTER E CAMPANHAS)
  useEffect(() => {
    async function loadData() {
      try {
        const [resTypes, resCamps, resPoster] = await Promise.all([
          api.get('campaigns-type'),
          api.get('campaigns'),
          api.get(`/posters/${id}`)
        ])

        setCampaignsType(resTypes.data)
        setCampaigns(resCamps.data)

        const poster = resPoster.data

        // Formatação de Datas
        const dInitial = poster.initial_date
          ? format(parseISO(poster.initial_date), 'dd/MM/yyyy')
          : ''
        const dFinal = poster.final_date
          ? format(parseISO(poster.final_date), 'dd/MM/yyyy')
          : ''

        // Preço Inteiro/Decimal para PosterView
        const [pInt, pDec] = String(poster.price).split(',')

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
        setPrice(`R$ ${poster.price}`)
        setRetailPrice(`R$ ${poster.price_retail || poster.price}`)
        setWholesalePrice(`R$ ${poster.price_wholesale || poster.price}`)
        setDateInitial(dInitial)
        setDateFinally(dFinal)
        setCampaignTypeSelected(String(poster.campaign_type_id))
        setCampaignSelected(String(poster.campaign_id))

        calculatePriceClass(String(poster.price))

        // Carregar imagem da campanha
        const currentCamp = resCamps.data.find(
          c => String(c.id) === String(poster.campaign_id)
        )
        if (currentCamp) {
          setUrlImageCampaigns(
            `${api.defaults.baseURL}/tmp/uploads/${currentCamp.image}`
          )
        }
      } catch (error) {
        toastError('Erro ao carregar dados do cartaz.')
      }
    }
    loadData()
  }, [id])

  // FUNÇÕES DE MANIPULAÇÃO (Mantidas da lógica da Home)
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
    const formattedValue = isNaN(numericValue)
      ? ''
      : FormatCurrency(numericValue)
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

  function calculatePriceClass(priceInteger) {
    if (priceInteger.length <= 4) setPriceClass('small-price')
    else if (priceInteger.length === 5) setPriceClass('medium-price')
    else if (priceInteger.length === 6) setPriceClass('large-price')
    else setPriceClass('x-large-price')
  }

  async function updatePoster() {
    try {
      await handleUpdatePoster(
        id,
        productInputs,
        dateInitial || null,
        dateFinal || null,
        campaignSelected,
        campaignTypeSelected
      )
      toastSuccess('Cartaz atualizado com sucesso!')
      setTimeout(() => navigate('/print'), 2000)
    } catch (error) {
      toastError('Erro ao atualizar cartaz.')
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <Form>
            <Section title="Layout do Cartaz">
              <div className="flex flex-row gap-4 w-full">
                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Tipo de Campanha</FieldLabel>
                  <Select
                    onValueChange={setCampaignTypeSelected}
                    value={campaignTypeSelected}
                  >
                    <SelectTrigger className="w-full shadow-none border-input">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignsType.map(type => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Campanha</FieldLabel>
                  <Select
                    onValueChange={val => {
                      setCampaignSelected(val)
                      const camp = campaigns.find(c => String(c.id) === val)
                      if (camp)
                        setUrlImageCampaigns(
                          `${api.defaults.baseURL}/tmp/uploads/${camp.image}`
                        )
                    }}
                    value={campaignSelected}
                  >
                    <SelectTrigger className="w-full shadow-none border-input">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map(camp => (
                        <SelectItem key={camp.id} value={String(camp.id)}>
                          {camp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            <Section title="Informações do Produto">
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Código do Produto</FieldLabel>
                  <Input
                    type="number"
                    name="product_id"
                    value={productInputs.product_id}
                    onChange={handleProductInputChange}
                    readOnly // Geralmente código não se altera na edição
                  />
                </Field>

                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Preço de Venda</FieldLabel>
                  <Input
                    name="price"
                    value={price}
                    onChange={handleInputChange}
                    placeholder="R$ 0,00"
                  />
                </Field>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Descrição Principal</FieldLabel>
                  <Textarea
                    name="description"
                    value={productInputs.description}
                    onChange={handleProductInputChange}
                    maxLength={30}
                    className="resize-none min-h-[60px]"
                  />
                </Field>

                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Complemento</FieldLabel>
                  <Textarea
                    name="complement"
                    value={productInputs.complement}
                    onChange={handleProductInputChange}
                    maxLength={19}
                    className="resize-none min-h-[60px]"
                  />
                </Field>
              </div>
            </Section>

            {campaignTypeSelected === '2' && (
              <Section title="Atacado">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <Field className="flex flex-col gap-2 flex-1">
                    <FieldLabel>Preço de Atacado</FieldLabel>
                    <Input
                      name="wholesalePrice"
                      value={wholesalePrice}
                      onChange={handleInputChange}
                    />
                  </Field>
                  <Field className="flex flex-col gap-2 flex-1">
                    <FieldLabel>Preço de Varejo</FieldLabel>
                    <Input
                      name="retailPrice"
                      value={retailPrice}
                      onChange={handleInputChange}
                    />
                  </Field>
                </div>
              </Section>
            )}

            <Section title="Validade">
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Data Inicial</FieldLabel>
                  <InputMask
                    name="initial_date"
                    mask="00/00/0000"
                    value={dateInitial}
                    onChange={handleProductInputChange}
                    icon={CalendarDays}
                  />
                </Field>
                <Field className="flex flex-col gap-2 flex-1">
                  <FieldLabel>Data Final</FieldLabel>
                  <InputMask
                    name="final_date"
                    mask="00/00/0000"
                    value={dateFinal}
                    onChange={handleProductInputChange}
                    icon={CalendarDays}
                  />
                </Field>
              </div>
            </Section>

            <Section>
              <div className="flex justify-start w-full">
                <Button
                  type="button"
                  onClick={updatePoster}
                  className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </div>
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
      </Container>
    </Layout>
  )
}
