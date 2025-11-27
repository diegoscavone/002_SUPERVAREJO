import { Container, Content, Form, InputWrapper, ButtonWrapper } from './styles'

import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { Input } from '../../components/Input'
import { Section } from '../../components/Section'

import { api } from '../../services/api'
import { Nav } from '../../components/Nav'

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Button } from '../../components/Button'
import { Label } from '../Home/styles'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { InputFile } from '../../components/InputFile'
import { PiCloudArrowUp } from 'react-icons/pi'
import { toastError, toastSuccess } from '../../styles/toastConfig'

export function CampaignDetails() {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState({})
  const { id } = useParams()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [campaignImageName, setCampaignImageName] = useState('')

  // Função para remover o hash do nome do arquivo
  function removeHashFromFilename(filename) {
    if (!filename) return ''
    
    // Encontra a posição do primeiro '-'
    const firstDashIndex = filename.indexOf('-')
    
    if (firstDashIndex !== -1) {
      // Remove tudo até o primeiro '-' (incluindo o '-')
      return filename.substring(firstDashIndex + 1)
    }
    
    // Se não tiver '-', retorna o nome original
    return filename
  }

  function handleNameChange(event) {
    setCampaignName(event.target.value)
  }

  function handleImageChange(event) {
    const file = event.target.files[0]
    setCampaignImage(file)
    setCampaignImageName(file ? file.name : '')
  }

  async function handleUpdateCampaign() {
    try {
      // Validação básica
      if (!campaignName.trim()) {
        toastError('Nome da campanha é obrigatório!')
        return
      }

      const formData = new FormData()
      formData.append('name', campaignName.trim())

      // Só adiciona a imagem se uma nova foi selecionada
      if (campaignImage) {
        formData.append('image', campaignImage)
      }

      // Para debug - remova em produção
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      const response = await api.patch(`/campaign-image/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toastSuccess('Campanha alterada com sucesso!')
      setTimeout(() => {
        navigate('/campaigns')
      }, 2000)
      
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error)
      
      // Tratamento de erro mais específico
      if (error.response) {
        // Erro do servidor (4xx, 5xx)
        const message = error.response.data?.message || 'Erro no servidor'
        toastError(`Erro: ${message}`)
      } else if (error.request) {
        // Erro de rede
        toastError('Erro de conexão. Verifique sua internet.')
      } else {
        // Outros erros
        toastError('Ocorreu um erro inesperado.')
      }
    }
  }

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await api.get(`/campaigns/details/${id}`)
        const campaignData = response.data
        
        setCampaign(campaignData)
        setCampaignName(campaignData.name || '')
        
        // Remove o hash do nome da imagem para exibição
        const cleanImageName = removeHashFromFilename(campaignData.image || '')
        setCampaignImageName(cleanImageName)
        
        console.log('Imagem original:', campaignData.image)
        console.log('Imagem sem hash:', cleanImageName)
        
      } catch (error) {
        console.error('Erro ao buscar campanha:', error)
        toastError('Erro ao buscar campanha.')
      }
    }
    
    if (id) {
      fetchCampaign()
    }
  }, [id])

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
                value={campaignName}
                onChange={handleNameChange}
                placeholder="Digite o nome da campanha"
              />
            </InputWrapper>

            <InputWrapper>
              <InputFile
                type="file"
                icon={PiCloudArrowUp}
                name="image"
                title={campaignImageName || 'Selecione imagem'}
                onChange={handleImageChange}
                accept="image/*"
              />
            </InputWrapper>
          </Section>
          
          <Section>
            <ButtonWrapper>
              <Button
                title="Salvar"
                color="GREEN"
                onClick={handleUpdateCampaign}
              />
            </ButtonWrapper>
          </Section>
        </Form>
      </Content>

      <Footer />
    </Container>
  )
}