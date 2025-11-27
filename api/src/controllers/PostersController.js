const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class PostersController {
  async create(request, response) {
    const {
      product_id,
      description,
      complement,
      packaging,
      price,
      price_retail,
      price_wholesale,
      initial_date,
      final_date,
      status,
      campaign_id,
      campaign_type_id,
      unit,
      fator_atacado
    } = request.body
    const user_id = request.user.id

    await knex('posters').insert({
      product_id,
      description,
      complement,
      packaging,
      price,
      price_retail,
      price_wholesale,
      initial_date,
      final_date,
      status,
      user_id: user_id,
      campaign_id,
      campaign_type_id,
      unit,
      fator_atacado
    })
    return response.json()
  }
  async show(request, response) {
    const { id } = request.params

    const posters = await knex('posters').where({ id }).first()

    const campaign = await knex('campaigns')
      .where({ id: posters.campaign_id })
      .first()

    const campaign_type = await knex('campaigns_type')
      .where({ id: posters.campaign_type_id })
      .first()

    return response.json({
      ...posters,
      campaign,
      campaign_type
    })
  }
  async index(request, response) {
    try {
      const posters = await knex
        .select(
          'id',
          'product_id',
          'description',
          'complement',
          'packaging',
          'price',
          'price_retail',
          'price_wholesale',
          'initial_date',
          'final_date',
          'status',
          'campaign_id',
          'campaign_type_id',
          'unit'
        )
        .table('posters')
      // .where('status', 0)

      const postersWithDetails = await Promise.all(
        posters.map(async poster => {
          const campaign = await knex
            .select('id', 'image')
            .table('campaigns')
            .where({ id: poster.campaign_id })
            .first()

          const campaign_type = await knex('campaigns_type')
            .where({ id: poster.campaign_type_id })
            .first()

          return {
            ...poster,
            campaign,
            campaign_type
          }
        })
      )
      return response.json(postersWithDetails)
    } catch (error) {
      console.log(error)
      return response.status(500).json({ message: 'Erro ao buscar cartazes' })
    }
  }
  async update(request, response) {
    const {
      product_id,
      description,
      complement,
      packaging,
      price,
      price_retail,
      price_wholesale,
      initial_date,
      final_date,
      status,
      campaign_id,
      campaign_type_id
    } = request.body

    const { id } = request.params
    const user_id = request.user.id
    try {
      await knex('posters').where('id', id).update({
        product_id,
        description,
        complement,
        packaging,
        price,
        price_retail,
        price_wholesale,
        initial_date,
        final_date,
        status,
        user_id: user_id,
        campaign_id,
        campaign_type_id
      })
      return response.status(200).send()
    } catch (error) {}
    console.error('Erro ao atualizar o pôster:', error)
    return response.status(500).json({ message: 'Erro ao atualizar o pôster' })
  }
  async updateStatus(request, response) {
    const { id } = request.params
    const { status } = request.body

    try {
      await knex('posters').where('id', id).update({ status })
      return response.status(200).send()
    } catch (error) {
      console.error('Erro ao atualizar o pôster:', error)
      return response
        .status(500)
        .json({ message: 'Erro ao atualizar o pôster' })
    }
  }
  async delete(request, response) {
    const { id } = request.params
    try {
      let query = knex('posters')
      if (id.includes(',')) {
        // Se houver vírgula, trata-se de uma lista de IDs
        const ids = id.split(',')
        query = query.whereIn('id', ids)
      } else {
        // Caso contrário, é um único ID
        query = query.where({ id })
      }

      const posters = await query

      if (!posters || posters.length === 0) {
        throw new AppError('Pôster(es) não encontrado(s).')
      }

      await query.delete()

      return response.json({ message: 'Pôster(es) excluído(s) com sucesso.' })
    } catch (error) {
      console.error('Erro ao excluir pôster(es):', error)
      return response.status(400).json({ error: 'Erro ao excluir pôster(es).' })
    }
  }
  async deleteOld(request, response) {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const deletedCount = await knex('posters')
        .where('created_at', '<', thirtyDaysAgo)
        .delete()

      return response.json({
        message: `${deletedCount} cartaz(es) com mais de 30 dias foram deletados.`
      })
    } catch (error) {
      console.error('Erro ao deletar cartazes antigos:', error)
      return response
        .status(500)
        .json({ message: 'Erro ao deletar cartazes antigos.' })
    }
  }
}

module.exports = PostersController
