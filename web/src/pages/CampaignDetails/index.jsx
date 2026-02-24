import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { api } from '../../services/api'
import { toastError, toastSuccess } from '../../styles/toastConfig'

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
import { Switch } from '@/components/ui/switch'
import { Check, CloudUpload, FileImage } from 'lucide-react'
import { Container, Content } from './styles'

export function CampaignDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [previewURL, setPreviewURL] = useState('') // Para o visualizador
  const [loading, setLoading] = useState(false)

  const [isVencimento, setIsVencimento] = useState(false)
const [isPriceRequired, setIsPriceRequired] = useState(true)

  // 1. Efeito para carregar os dados iniciais
  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await api.get(`/campaigns/details/${id}`)
        const { name, image, is_vencimento, is_price_required} = response.data

        setCampaignName(name || '')
        setIsVencimento(is_vencimento)
        setIsPriceRequired(is_price_required)

        if (image) {
          // Define a URL inicial vinda do backend
          setPreviewURL(`${api.defaults.baseURL}/tmp/uploads/${image}`)
        }
      } catch (error) {
        toastError('Erro ao carregar dados da campanha.')
      }
    }
    fetchCampaign()
  }, [id])

  // 2. Lógica do Visualizador de Imagem (Preview)
  function handleImageChange(event) {
    const file = event.target.files[0]
    if (file) {
      setCampaignImage(file)
      // Cria uma URL temporária para o preview imediato
      const url = URL.createObjectURL(file)
      setPreviewURL(url)
    }
  }

  async function handleUpdateCampaign() {
    if (!campaignName.trim()) return toastError('O nome é obrigatório!')

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', campaignName.trim())
      formData.append('is_vencimento', isVencimento)
      formData.append('is_price_required', isPriceRequired)
      if (campaignImage) {
        formData.append('image', campaignImage)
      }

      console.log(isVencimento)


      await api.patch(`/campaign-image/${id}`, formData)

      toastSuccess('Campanha atualizada com sucesso!')
      setTimeout(() => navigate('/campaigns'), 1500)
    } catch (error) {
      toastError('Erro ao atualizar. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  // Quando ligar Vencimento, desliga Preço Obrigatório
function handleVencimentoChange(value) {
  setIsVencimento(value);
  if (value === true) {
    setIsPriceRequired(false);
  }
}

// Quando ligar Preço Obrigatório, desliga Vencimento
function handlePriceRequiredChange(value) {
  setIsPriceRequired(value);
  if (value === true) {
    setIsVencimento(false);
  }
}

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Content>
          <div className="container max-w-4xl py-10 px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Coluna do Formulário */}
              <div className="md:col-span-7">
                <Card className="border-none shadow-none">
                  <CardHeader>
                    <CardTitle className="text-green-600">
                      Configurações Gerais
                    </CardTitle>
                    <CardDescription>
                      Altere o nome e a identidade visual da campanha.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <FieldLabel className="text-neutral-500" htmlFor="name">
                        Nome da Campanha
                      </FieldLabel>
                      <Input
                        id="name"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        placeholder="Ex: Ofertas da Semana"
                        className="text-neutral-600"
                      />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                      <FieldLabel className="text-neutral-500" htmlFor="image">
                        Imagem do Cartaz (Template)
                      </FieldLabel>

                      {/* Container do Input Customizado */}
                      <div className="relative">
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden" // Escondemos o input original
                        />

                        <FieldLabel
                          htmlFor="image"
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50 hover:bg-orange-50 hover:border-orange-300 transition-all group
"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <CloudUpload
                                size={24}
                                className="text-orange-500"
                              />
                            </div>
                            <p className="text-sm text-slate-600 font-bold">
                              Clique para selecionar
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              PNG, JPG ou JPEG (Recomendado: Vertical)
                            </p>
                          </div>
                        </FieldLabel>
                      </div>
                    </div>

                   {/* Seção de Regras de Negócio (Switches) */}
<div className="flex flex-col gap-4 pt-4 border-t">
  <div className="flex items-center justify-between space-x-2">
    <div className="flex flex-col space-y-1">
      <FieldLabel htmlFor="vencimento-mode" className="text-neutral-500">
        Modo Vencimento
      </FieldLabel>
      <p className="text-xs text-neutral-500">
        Ativado irá mostrar somente o campo de validade do produto.
      </p>
    </div>
    <Switch
      id="vencimento-mode"
      checked={isVencimento}
      onCheckedChange={handleVencimentoChange} // Função customizada
      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-200"
    />
  </div>

  <div className="flex items-center justify-between space-x-2">
    <div className="flex flex-col space-y-1">
      <FieldLabel htmlFor="price-required" className="text-neutral-500 ">
        Preço Obrigatório
      </FieldLabel>
      <p className="text-xs text-neutral-500">
       Ativado irá mostrar somente o campo de preço do produto.
      </p>
    </div>
    <Switch
      id="price-required"
      checked={isPriceRequired}
      onCheckedChange={handlePriceRequiredChange} // Função customizada
      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-200"
    />
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
                      onClick={handleUpdateCampaign}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        'Salvando...'
                      ) : (
                        <>
                          <Check /> Salvar
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Coluna do Visualizador (Preview) */}
              <div className="md:col-span-5">
                <Card className="h-full overflow-hidden border-none shadow-none">
                  <CardContent className="p-0 flex items-center justify-center bg-slate-100 min-h-[400px]">
                    {previewURL ? (
                      <img
                        src={previewURL}
                        alt="Preview"
                        className="w-full h-full object-contain max-h-[500px]"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-10">
                        <FileImage
                          size={60}
                          className="mx-auto mb-2 opacity-20"
                        />
                        <p className="text-sm font-medium">
                          Nenhuma imagem carregada
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
