import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { api } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Check, CloudUpload, FileImage } from 'lucide-react'
import { Container, Content } from './styles'

export function NewCampaign() {
  const navigate = useNavigate()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [previewURL, setPreviewURL] = useState('') // Visualizador em tempo real
  const [loading, setLoading] = useState(false)

  // Lógica para capturar a imagem e gerar o preview
  function handleImageChange(event) {
    const file = event.target.files[0]
    if (file) {
      setCampaignImage(file)
      // Gera URL temporária para o componente de visualização
      const url = URL.createObjectURL(file)
      setPreviewURL(url)
    }
  }

  async function handleCampaign() {
    if (!campaignName.trim() || !campaignImage) {
      toastInfo('Por favor, preencha o nome e selecione uma imagem!')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', campaignName.trim())
      formData.append('image', campaignImage)

      await api.post('/campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toastSuccess('Campanha criada com sucesso!')
      setTimeout(() => navigate('/campaigns'), 2000)
    } catch (error) {
      toastError('Erro ao criar campanha!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <div className="container max-w-4xl py-10 px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Formulário - Coluna Esquerda */}
              <div className="md:col-span-7">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Configurações Gerais
                    </CardTitle>
                    <CardDescription>
                      Cadastre o nome e a identidade visual da campanha.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {/* Input Nome */}
                    <div className="space-y-2">
                      <FieldLabel htmlFor="name" className="text-neutral-500">
                        Nome da campanha
                      </FieldLabel>
                      <Input
                        id="name"
                        placeholder="Ex: Quarta do Hortifruti"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        className="text-neutral-600"
                      />
                    </div>

                    {/* Upload Estilizado (Dropzone Style) */}
                    <div className="space-y-2">
                      <FieldLabel className="text-neutral-500">
                        Imagem do Cartaz (Template)
                      </FieldLabel>
                      <div className="relative">
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <FieldLabel
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-orange-50 hover:border-orange-300 transition-all group"
                        >
                          <div className="flex flex-col items-center justify-center text-center px-4">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <CloudUpload
                                size={28}
                                className="text-orange-500"
                              />
                            </div>
                            <p className="text-sm text-slate-600 font-bold">
                              {campaignImage
                                ? campaignImage.name
                                : 'Clique para selecionar'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              PNG, JPG ou JPEG (Recomendado: Vertical)
                            </p>
                          </div>
                        </FieldLabel>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t pt-4 pb-4">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/campaigns')}
                      className="text-neutral-500 hover:text-neutral-500"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCampaign}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                    >
                      {loading ? (
                        'Criando...'
                      ) : (
                        <>
                          <Check /> Salvar
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Visualizador - Coluna Direita */}
              <div className="md:col-span-5">
                <Card className="sticky top-6 overflow-hidden shadow-none h-fit">
                  <CardContent className="p-0 flex items-center justify-center bg-slate-200 min-h-[450px]">
                    {previewURL ? (
                      <img
                        src={previewURL}
                        alt="Preview"
                        className="w-full h-full object-contain max-h-[600px] shadow-2xl animate-in fade-in zoom-in duration-300"
                        style={{ objectPosition: 'top' }} // Alinhado ao topo como na listagem
                      />
                    ) : (
                      <div className="text-center p-12 text-slate-400">
                        <FileImage
                          size={80}
                          className="mx-auto mb-4 opacity-10"
                        />
                        <p className="text-sm font-medium italic">
                          Selecione uma imagem para visualizar
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Content>
      </Container>
    </Layout>
  )
}
