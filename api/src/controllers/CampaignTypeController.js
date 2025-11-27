const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class CampaignTypeController {
  async create(request, response) {
    const { name } = request.body
    await knex('campaigns_type').insert({
      name
    })
    return response.json()
  }

  async index(request, response) {
    const campaignsType = await knex('campaigns_type').select('*')
    return response.json(campaignsType)
  }

  async show(request, response){
    try {
      const { id } = request.params
      const campaignType = await knex('campaigns_type').where({ id }).first()

      if(!campaignType){
        throw new AppError('Tipo de Campanha não encontrada')
      }
      return response.json(campaignType)
    } catch (error) {
      throw new AppError('Tipo de Campanha não encontrada')
    }
  }
}

module.exports = CampaignTypeController
