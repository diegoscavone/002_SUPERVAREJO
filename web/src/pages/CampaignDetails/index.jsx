import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, CloudUpload, FileImage, Loader2, X } from 'lucide-react'

import { api } from '../../services/api'
import { toastError, toastSuccess } from '../../styles/toastConfig'

import { Layout } from '@/components/Layout'
import { Button } from '@/components/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { InputCustom } from '@/components/InputCustom'

export function CampaignDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [previewURL, setPreviewURL] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [isVencimento, setIsVencimento] = useState(false)
  const [isPriceRequired, setIsPriceRequired] = useState(true)

  // 1. Carregamento inicial da campanha
  useEffect(() => {
    async function fetchCampaign() {
      try {
        setFetching(true)
        const response = await api.get(`/campaigns/details/${id}`)
        const { name, image, is_vencimento, is_price_required } = response.data

        setCampaignName(name || '')
        setIsVencimento(Boolean(is_vencimento))
        setIsPriceRequired(Boolean(is_price_required))

        if (image) {
          setPreviewURL(`${api.defaults.baseURL}/tmp/uploads/${image}`)
        }
      } catch (error) {
        toastError('Erro ao carregar dados da campanha.')
      } finally {
        setFetching(false)
      }
    }

    if (id) {
      fetchCampaign()
    }
  }, [id])

  // Limpeza de memory leak do URL.createObjectURL
  useEffect(() => {
    return () => {
      if (previewURL && previewURL.startsWith('blob:')) {
        URL.revokeObjectURL(previewURL)
      }
    }
  }, [previewURL])

  // 2. Manipulação de upload da imagem e preview
  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (file) {
      if (previewURL && previewURL.startsWith('blob:')) {
        URL.revokeObjectURL(previewURL)
      }
      setCampaignImage(file)
      setPreviewURL(URL.createObjectURL(file))
    }
  }

  // 3. Atualização da Campanha
  async function handleUpdateCampaign() {
    if (!campaignName.trim()) {
      return toastError('O nome da campanha é obrigatório!')
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', campaignName.trim())
      formData.append('is_vencimento', isVencimento)
      formData.append('is_price_required', isPriceRequired)

      if (campaignImage) {
        formData.append('image', campaignImage)
      }

      await api.patch(`/campaign-image/${id}`, formData)

      toastSuccess('Campanha atualizada com sucesso!')
      setTimeout(() => navigate('/campaigns'), 1200)
    } catch (error) {
      toastError('Erro ao atualizar a campanha. Verifique os dados enviados.')
    } finally {
      setLoading(false)
    }
  }

  function handleVencimentoChange(checked) {
    setIsVencimento(checked)
    if (checked) setIsPriceRequired(false)
  }

  function handlePriceRequiredChange(checked) {
    setIsPriceRequired(checked)
    if (checked) setIsVencimento(false)
  }

  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {fetching ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              Carregando dados da campanha...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna 1: Formulário de Configurações */}
            <section className="lg:col-span-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-lg font-semibold text-green-600">
                    Configurações da Campanha
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    Edite as informações cadastrais, regras de precificação e o
                    cartaz modelo.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Nome da Campanha */}
                  <div className="flex flex-col gap-2">
                    <InputCustom
                      label="Nome da Campanha"
                      id="campaign-name"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                      placeholder="Ex: Ofertas de Fim de Semana"
                    />
                  </div>

                  {/* Upload do Cartaz */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      Imagem do Cartaz (Template)
                    </Label>

                    <label
                      htmlFor="campaign-image"
                      className="flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-400 transition-all group"
                    >
                      <div className="p-2.5 bg-white rounded-full shadow-xs mb-2 group-hover:scale-105 transition-transform">
                        <CloudUpload className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PNG, JPG ou JPEG (Recomendado formato vertical)
                      </p>
                      <input
                        id="campaign-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Regras de Exibição / Switches */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Comportamento dos Cartazes
                    </h4>

                    {/* Switch: Modo Vencimento */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="vencimento-mode"
                          className="text-sm font-medium text-slate-800 cursor-pointer"
                        >
                          Modo Vencimento
                        </Label>
                        <p className="text-xs text-slate-500">
                          Prioriza o campo de validade do lote em vez da
                          precificação padrão.
                        </p>
                      </div>
                      <Switch
                        id="vencimento-mode"
                        checked={isVencimento}
                        onCheckedChange={handleVencimentoChange}
                        className="data-[state=checked]:bg-green-600 shrink-0"
                      />
                    </div>

                    {/* Switch: Preço Obrigatório */}
                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="price-required"
                          className="text-sm font-medium text-slate-800 cursor-pointer"
                        >
                          Preço Obrigatório
                        </Label>
                        <p className="text-xs text-slate-500">
                          Exige o preenchimento obrigatório de valor para
                          geração do cartaz.
                        </p>
                      </div>
                      <Switch
                        id="price-required"
                        checked={isPriceRequired}
                        onCheckedChange={handlePriceRequiredChange}
                        className="data-[state=checked]:bg-green-600 shrink-0"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    color="cancel"
                    onClick={() => navigate('/campaigns')}
                  >
                    <X className="h-4 w-4 mr-1.5" /> Cancelar
                  </Button>

                  <Button
                    type="button"
                    color="green"
                    onClick={handleUpdateCampaign}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </section>

            {/* Coluna 2: Visualizador do Template (Preview) */}
            <aside className="lg:col-span-4">
              <Card className="border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/60">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Pré-visualização do Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-center bg-slate-100/60 min-h-[350px] sm:min-h-[440px]">
                  {previewURL ? (
                    <div className="relative w-full flex items-center justify-center rounded-lg overflow-hidden border border-slate-200 bg-white p-2">
                      <img
                        src={previewURL}
                        alt="Pré-visualização da campanha"
                        className="max-h-[480px] w-auto max-w-full object-contain rounded shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <FileImage className="h-14 w-14 mb-2 stroke-[1.25] text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">
                        Nenhum cartaz carregado
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Selecione um arquivo de imagem para visualizar o cartaz.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>
    </Layout>
  )
}
