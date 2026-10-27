import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileImage,
  Plus,
  Trash2,
  TriangleAlert,
  ImageOff,
  Tag
} from 'lucide-react'

import { api } from '@/services/api'
import { Layout } from '@/components/Layout'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Button } from '@/components/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toastError, toastSuccess } from '@/styles/toastConfig'

export function Campaign() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/campaigns')
      setCampaigns(response.data)
    } catch (error) {
      toastError('Erro ao buscar campanhas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const getImageUrl = useCallback(imageName => {
    if (!imageName) return null
    return `${api.defaults.baseURL}/tmp/uploads/${imageName}`
  }, [])

  function handleOpenDeleteModal(e, item) {
    e.stopPropagation()
    setCampaignToDelete(item)
    setIsDeleteModalOpen(true)
  }

  function handleCloseModal() {
    setIsDeleteModalOpen(false)
    setCampaignToDelete(null)
  }

  async function handleConfirmDelete() {
    if (!campaignToDelete) return

    try {
      setIsDeleting(true)
      await api.delete(`/campaigns/${campaignToDelete.id}`)

      setCampaigns(prev => prev.filter(c => c.id !== campaignToDelete.id))
      toastSuccess('Campanha removida com sucesso!')
      handleCloseModal()
    } catch (error) {
      toastError('Erro ao excluir campanha.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-none">
          <div>
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-green-600" />
              <h1 className="text-xl font-bold tracking-tight text-green-600">
                Gestão de Campanhas
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Gerencie os templates de encartes e materiais promocionais.
            </p>
          </div>

          <Button
            onClick={() => navigate('/campaigns/new')}
            color="orange"
            label="Nova Campanha"
            icon={Plus}
          />
        </div>

        {/* Lista de Cards / Grid Responsivo */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-56 bg-slate-100 rounded-xl animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-full mb-3 text-slate-400">
              <ImageOff className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Nenhuma campanha cadastrada
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Comece adicionando uma nova campanha para gerar cartazes
              personalizados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {campaigns.map(item => {
              const imageUrl = getImageUrl(item.image)

              return (
                <Card
                  key={item.id}
                  onClick={() => navigate(`/campaigns/details/${item.id}`)}
                  className="group flex flex-col overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  {/* Container da Imagem */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        onError={e => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove(
                            'hidden'
                          )
                        }}
                      />
                    ) : null}

                    {/* Fallback de preview caso falhe ou não tenha */}
                    <div
                      className={`flex flex-col items-center justify-center h-full text-slate-300 gap-2 ${imageUrl ? 'hidden' : 'flex'}`}
                    >
                      <FileImage className="w-10 h-10 stroke-1" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Sem Prévia
                      </span>
                    </div>
                  </div>

                  {/* Header / Ações */}
                  <CardHeader className="p-3.5 sm:p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle
                      className="text-sm sm:text-base font-semibold text-slate-700 truncate pr-2"
                      title={item.name}
                    >
                      {item.name}
                    </CardTitle>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      onClick={e => handleOpenDeleteModal(e, item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        )}

        {/* Modal de Confirmação */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          variant="destructive"
          title="Remover Campanha"
          icon={TriangleAlert}
          confirmButtonText="Sim, Remover"
          content={
            <p className="text-sm text-slate-600">
              Tem certeza que deseja remover a campanha{' '}
              <strong className="text-slate-900 font-semibold">
                {campaignToDelete?.name}
              </strong>
              ? Esta ação é irreversível e removerá o template visual.
            </p>
          }
        />
      </div>
    </Layout>
  )
}
