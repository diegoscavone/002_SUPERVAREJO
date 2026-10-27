import { Check, CloudUpload, FileImage, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '../../services/api'
import { toastError, toastInfo, toastSuccess } from '../../styles/toastConfig'

import { InputCustom } from '@/components/InputCustom'
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
import { Switch } from '@/components/ui/switch'

export function NewCampaign() {
  const navigate = useNavigate()

  const [campaignName, setCampaignName] = useState('')
  const [campaignImage, setCampaignImage] = useState(null)
  const [previewURL, setPreviewURL] = useState('')
  const [loading, setLoading] = useState(false)

  const [isVencimento, setIsVencimento] = useState(false)
  const [isPriceRequired, setIsPriceRequired] = useState(true)

  // Prevenção de memory leak com URLs temporárias de preview
  useEffect(() => {
    return () => {
      if (previewURL && previewURL.startsWith('blob:')) {
        URL.revokeObjectURL(previewURL)
      }
    }
  }, [previewURL])

  // Exclusividade mútua das regras de negócio
  function handleVencimentoChange(checked) {
    setIsVencimento(checked)
    if (checked) {
      setIsPriceRequired(false)
    }
  }

  function handlePriceRequiredChange(checked) {
    setIsPriceRequired(checked)
    if (checked) {
      setIsVencimento(false)
    }
  }

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

  async function handleCampaign() {
    if (!campaignName.trim() || !campaignImage) {
      return toastInfo('Por favor, preencha o nome e selecione uma imagem!')
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', campaignName.trim())
      formData.append('image', campaignImage)
      formData.append('is_vencimento', isVencimento)
      formData.append('is_price_required', isPriceRequired)

      await api.post('/campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toastSuccess('Campanha criada com sucesso!')
      setTimeout(() => navigate('/campaigns'), 1500)
    } catch (error) {
      toastError(error.response?.data?.message || 'Erro ao criar campanha!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulário - Coluna Principal */}
          <section className="lg:col-span-7">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg font-semibold text-green-600">
                  Nova Campanha
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Cadastre o nome, a imagem base do cartaz e as regras de
                  precificação.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Nome da Campanha */}
                <div className="flex flex-col gap-2">
                  <InputCustom
                    label="Nome da Campanha"
                    placeholder="Ex: Quarta do Hortifruti"
                    value={campaignName}
                    onChange={e => setCampaignName(e.target.value)}
                  />
                </div>

                {/* Dropzone Upload */}
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    Imagem do Cartaz (Template)
                  </Label>

                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full min-h-[150px] px-4 py-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-green-50/30 hover:border-green-400 transition-all group"
                  >
                    <div className="p-2.5 bg-white rounded-full shadow-xs mb-2 group-hover:scale-105 transition-transform">
                      <CloudUpload className="h-6 w-6 text-green-600" />
                    </div>

                    <p className="text-sm font-semibold text-slate-700 text-center">
                      {campaignImage
                        ? campaignImage.name
                        : 'Clique para selecionar uma imagem'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PNG, JPG ou JPEG (Recomendado: formato vertical)
                    </p>

                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Switches de Regra de Negócio */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Regras de Exibição
                  </h4>

                  {/* Switch Vencimento */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="vencimento-mode"
                        className="text-sm font-medium text-slate-800 cursor-pointer"
                      >
                        Modo Vencimento
                      </Label>
                      <p className="text-xs text-slate-500">
                        Ativado exibirá apenas o campo de validade do produto no
                        cartaz.
                      </p>
                    </div>
                    <Switch
                      id="vencimento-mode"
                      checked={isVencimento}
                      onCheckedChange={handleVencimentoChange}
                      className="data-[state=checked]:bg-green-600 shrink-0"
                    />
                  </div>

                  {/* Switch Preço Obrigatório */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-0.5">
                      <Label
                        htmlFor="price-required"
                        className="text-sm font-medium text-slate-800 cursor-pointer"
                      >
                        Preço Obrigatório
                      </Label>
                      <p className="text-xs text-slate-500">
                        Ativado exigirá o valor de venda do produto para gerar o
                        cartaz.
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

              {/* Ações / Footer */}
              <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  color="cancel"
                  onClick={() => navigate('/campaigns')}
                  label="Cancelar"
                  icon={X}
                />

                <Button
                  type="button"
                  color="green"
                  onClick={handleCampaign}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Criando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Salvar Campanha</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </section>

          {/* Visualizador - Coluna Direita (Sticky) */}
          <aside className="lg:col-span-5">
            <Card className="border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/60">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Visualização do Template
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-slate-100/60 min-h-[350px] sm:min-h-[460px]">
                {previewURL ? (
                  <div className="relative w-full flex items-center justify-center rounded-lg overflow-hidden border border-slate-200 bg-white p-2">
                    <img
                      src={previewURL}
                      alt="Pré-visualização do cartaz"
                      className="max-h-[520px] w-auto max-w-full object-contain rounded shadow-xs animate-in fade-in zoom-in-95 duration-200"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <FileImage className="h-16 w-16 mb-2 stroke-[1.2] text-slate-300 opacity-60" />
                    <p className="text-sm font-medium text-slate-600">
                      Nenhuma imagem selecionada
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                      Faça o upload do cartaz ao lado para visualizar a prévia
                      aqui.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </Layout>
  )
}
