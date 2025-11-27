import { api } from '../services/api'
import { toastError } from '../styles/toastConfig'

function useUpdatePoster() {
  // Função para trasnformar a data no formato yyyy/mm/dd
  function transformDate(date) {
    if (!date) {
      return null
    }
    const [day, month, year] = date.split('/')
    const currentTime = new Date().toLocaleTimeString()
    return `${year}-${month}-${day} ${currentTime}`
  }

  async function handleUpdatePoster(
    id,
    productInputs,
    dateInitial,
    dateFinal,
    campaignSelected,
    campaignTypeSelected
  ) {
    const formatedDateInitial = transformDate(dateInitial)
    const formatedDateFinal = transformDate(dateFinal)

    const data = {
      product_id: productInputs.product_id,
      description: productInputs.description,
      complement: productInputs.complement,
      packaging: productInputs.packaging,
      price: productInputs.price,
      initial_date: formatedDateInitial,
      final_date: formatedDateFinal,
      status: productInputs.status,
      campaign_id: campaignSelected,
      campaign_type_id: campaignTypeSelected
    }
    try {
      const response = await api.put(`/posters/${id}`, data)
      return response
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Erro ao atualizar cartaz.'
      toastError(errorMessage)
      throw error
    }
  }

  return handleUpdatePoster
}

export { useUpdatePoster }
