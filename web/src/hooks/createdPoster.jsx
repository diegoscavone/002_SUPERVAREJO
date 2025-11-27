import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../hooks/auth'

function useCreatedPoster() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Função para transformar a data no formato yyyy-mm-dd
  function transformDate(date) {
    try {
      if (!date || date.trim() === '') {
        return null // ou return '';
      }

      const [day, month, year] = date.split('/')

      if (!day || !month || !year) {
        throw new Error('Formato de data inválido. Use DD/MM/YYYY')
      }

      // Pega apenas a hora:minuto:segundo para o formato do banco
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const currentTime = `${hours}:${minutes}:${seconds}`

      return `${year}-${month}-${day} ${currentTime}`
    } catch (error) {
      console.error('Erro ao transformar data:', error)
      throw error
    }
  }

  async function handleCreatePoster(
    productInputs,
    dateInitial,
    dateFinal,
    campaignSelected,
    campaignTypeSelected
  ) {
    try {
      if (!productInputs) {
        throw new Error('Dados do produto ou datas não fornecidos')
      }

      const formatedDateInitial = dateInitial ? transformDate(dateInitial) : null
      const formatedDateFinal = dateFinal ? transformDate(dateFinal) : null

      // Obtém a unidade do usuário logado, garantindo que seja formatada corretamente
      const userUnit =
        user && user.unit ? String(user.unit).padStart(3, '0') : null

      if (!userUnit) {
        throw new Error('Unidade do usuário não identificada')
      }

      const data = {
        product_id: productInputs.product_id,
        description: productInputs.description,
        complement: productInputs.complement,
        packaging: productInputs.packaging,
        price: productInputs.price,
        price_retail: productInputs.price_retail,
        price_wholesale: productInputs.price_wholesale,
        initial_date: formatedDateInitial,
        final_date: formatedDateFinal,
        status: 0,
        campaign_id: campaignSelected,
        campaign_type_id: campaignTypeSelected,
        unit: userUnit, // Usa a unidade do usuário logado
        fator_atacado: productInputs.fator_atacado
      }

      const response = await api.post('/posters', data)

      if (response && response.data) {
        alert('Poster criado com sucesso!')
        return response.data
      }

      return null
    } catch (error) {
      console.error('Erro ao criar poster:', error)

      // Melhoria no tratamento de erros
      if (error.response) {
        // O servidor respondeu com um status de erro
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          'Erro ao criar poster'
        alert(errorMessage)
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        alert('Erro de conexão com o servidor. Verifique sua internet.')
      } else {
        // Erro na configuração da requisição
        alert(error.message || 'Erro ao processar requisição')
      }

      throw error // Propaga o erro para quem chamou a função
    }
  }

  return handleCreatePoster
}

export { useCreatedPoster }
