import { Container, Content } from './styles'

import { useEffect, useState } from 'react'

import { api } from '../../services/api'

import { ConfirmModal } from '@/components/ConfirmModal'
import { Layout } from '@/components/Layout'
import { Section } from '@/components/Section'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { FileImage, Trash2, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { toastError, toastSuccess } from '../../styles/toastConfig'

export function Campaign() {
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState([])
  const [urlImageCampaigns, setUrlImageCampaigns] = useState({})

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  function handleOpenDeleteModal(campaignItem) {
    setCampaignToDelete(campaignItem)
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

      setCampaign(prev => prev.filter(c => c.id !== campaignToDelete.id))
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
      <ToastContainer />
      <Container>
        <Content>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-none">
            <h1 className="text-base font-bold text-neutral-500">
              Gestão de Campanhas
            </h1>
            <Button
              onClick={() => navigate('/campaigns/new')}
              className="bg-orange-500 hover:bg-orange-600 text-white shadow-none"
            >
              <FileImage />
              Nova Campanha
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white rounded-xl">
            {campaign.map(item => (
              <Card
                key={item.id}
                className="overflow-hidden flex flex-col h-full border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleDetails(item.id)}
              >
                {/* Container da Imagem:
        - h-64 ou h-80 (aumentei um pouco para valorizar a verticalidade do cartaz)
        - overflow-hidden é essencial para manter o arredondamento do card
      */}
                <div className="relative h-36 w-full overflow-hidden bg-white border-b border-slate-100">
                  {urlImageCampaigns[item.image] ? (
                    <img
                      src={urlImageCampaigns[item.image]}
                      alt={item.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                      <FileImage size={40} />
                      <span className="text-[10px] uppercase tracking-wider font-semibold">
                        Sem Prévia
                      </span>
                    </div>
                  )}
                </div>

                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 bg-white">
                  <CardTitle className="text-base font-semibold text-neutral-600 line-clamp-1">
                    {item.name}
                  </CardTitle>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                    onClick={e => {
                      e.stopPropagation() // Não abre os detalhes
                      handleOpenDeleteModal(item)
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>

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
              <p>
                Tem certeza que deseja remover a campanha{' '}
                <strong>{campaignToDelete?.name}</strong>? Esta ação é
                irreversível e removerá o template visual.
              </p>
            }
          />
        </Content>
      </Container>
    </Layout>
  )
}
