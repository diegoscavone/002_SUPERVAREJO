import { Container, Content, Section, Form, InputWrapper } from './styles'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Cards } from '../../components/Cards'

import { useEffect, useState } from 'react'

import { api } from '../../services/api'
import { Nav } from '../../components/Nav'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { PiFileImage } from 'react-icons/pi'
import { toastError, toastSuccess } from '../../styles/toastConfig'

export function Campaign() {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState([])
  const [urlImageCampaigns, setUrlImageCampaigns] = useState({})

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await api.get('/campaigns')
        setCampaign(response.data)
      } catch (error) {
        toastError('Erro ao buscar campanhas:', error)
      }
    }
    fetchCampaign()
  }, [])

  useEffect(() => {
    if (campaign.length > 0) {
      campaign.forEach(campaign => handleImageCampaign(campaign.image))
    }
  }, [campaign])

  function handleDetails(id) {
    navigate(`/campaigns/details/${id}`)
  }

  async function handleImageCampaign(campaignImage) {
    try {
      const imageCampaign = `${api.defaults.baseURL}/tmp/uploads/${campaignImage}`
      setUrlImageCampaigns(prevUrls => ({
        ...prevUrls,
        [campaignImage]: imageCampaign
      }))
    } catch (error) {
      toastError(`Erro ao buscar imagem da campanha ${campaignImage}:`, error)
      toastError('Não foi possivel buscar a imagem', 401)
    }
  }

  async function handleDeleteCampaign(campaignId) {
    const confirm = window.confirm('Deseja realmente remover a campanha?')

    if (confirm) {
      try {
        await api.delete(`/campaigns/${campaignId}`)
        setCampaign(prevCampaigns =>
          prevCampaigns.filter(c => c.id !== campaignId)
        )
        toastSuccess('Campanha deletada com sucesso!')
        navigate('/campaigns')
      } catch (error) {
        toastError('Ocorreu um erro.')
      }
    }
  }

  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Form>
          <InputWrapper>
            <Button
              title="Nova Campanha"
              icon={PiFileImage}
              color="ORANGE"
              onClick={() => navigate('/campaigns/new')}
            />
          </InputWrapper>
        </Form>
        <Section>
          {campaign.map(campaign => (
            <Cards
              key={campaign.id}
              title={campaign.name}
              img={urlImageCampaigns[campaign.image]}
              onDelete={() => handleDeleteCampaign(campaign.id)}
              onClick={() => handleDetails(campaign.id)}
            />
          ))}
        </Section>
      </Content>

      <Footer />
    </Container>
  )
}
