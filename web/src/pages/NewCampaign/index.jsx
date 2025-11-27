import { Container, Content, Form, InputWrapper, ButtonWrapper } from './styles'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Input } from '../../components/Input'
import { InputFile } from '../../components/InputFile'
import { Section } from '../../components/Section'

import { api } from '../../services/api'
import { Nav } from '../../components/Nav'

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from '../../components/Button'
import { Label } from '../Home/styles'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiCloudArrowUp } from 'react-icons/pi'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

export function NewCampaign() {
  const navigate = useNavigate()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [campaignImageName, setCampaignImageName] = useState('')

  async function handleCampaign() {
    if (!campaignName || !campaignImage) {
      toastInfo('Por favor, preencha todos os campos!')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', campaignName)
      formData.append('image', campaignImage)

      const response = await api.post('/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toastSuccess('Campanha criada com sucesso!')
      setTimeout(() => {
        navigate('/campaigns')
      }, 2000)
      return response.data
    } catch (error) {
      toastError('Erro ao criar campanha!')
    }
  }

  function handleImageChange(event) {
    const file = event.target.files[0]
    setCampaignImage(file)
    setCampaignImageName(file.name)
    console.log(campaignImageName)
  }

  return (
    <Container>
      <Header />
      <Nav />
      <ToastContainer />
      <Content>
        <Form>
          <Section title="Informações da Campanha">
            <InputWrapper>
              <Label>Nome da campanha</Label>
              <Input
                name="name"
                onChange={e => setCampaignName(e.target.value)}
              />
            </InputWrapper>

            <InputWrapper>
              <InputFile
                type="file"
                icon={PiCloudArrowUp}
                title={campaignImageName ? campaignImageName : 'Selecione imagem'}
                name="image"
                onChange={handleImageChange}
              />
            </InputWrapper>
          </Section>

          <Section>
            <ButtonWrapper>
              <Button
                title="Salvar"
                color="GREEN"
                onClick={handleCampaign}
              />
            </ButtonWrapper>
          </Section>
        </Form>
      </Content>

      <Footer />
    </Container>
  )
}
