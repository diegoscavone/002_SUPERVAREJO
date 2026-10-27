const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class PostersController {
  // async create(request, response) {
  //   const {
  //     product_id,
  //     description,
  //     complement,
  //     packaging,
  //     price,
  //     price_retail,
  //     price_wholesale,
  //     initial_date,
  //     final_date,
  //     status,
  //     campaign_id,
  //     campaign_type_id,
  //     unit,
  //     fator_atacado
  //   } = request.body

  //   const user_id = request.user.id
  //   // Garante a unidade do usuário caso não venha no body
  //   const user_unit = request.user.unit

  //   if (!product_id || !description) {
  //     throw new AppError('Código e descrição do produto são obrigatórios.')
  //   }

  //   const [id] = await knex('posters').insert({
  //     product_id,
  //     description,
  //     complement,
  //     packaging,
  //     price,
  //     price_retail,
  //     price_wholesale,
  //     initial_date,
  //     final_date,
  //     status: status !== undefined ? Number(status) : 0, // Garante que nasce como 0 (Não Impresso)
  //     user_id,
  //     campaign_id,
  //     campaign_type_id,
  //     unit: unit ? Number(unit) : Number(user_unit || 1), // Garante tipo numérico
  //     fator_atacado
  //   })

  //   return response.status(201).json({ id, message: 'Cartaz cadastrado com sucesso!' })
  // }
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
    const user_unit = request.user.unit

    if (!product_id || !description) {
      throw new AppError('Código e descrição do produto são obrigatórios.')
    }

    // Compatível com PostgreSQL e SQLite:
    const result = await knex('posters')
      .insert({
        product_id,
        description,
        complement,
        packaging,
        price,
        price_retail,
        price_wholesale,
        initial_date,
        final_date,
        status: status !== undefined ? Number(status) : 0,
        user_id,
        campaign_id: Number(campaign_id),
        campaign_type_id: campaign_type_id ? Number(campaign_type_id) : null,
        unit: unit ? Number(unit) : Number(user_unit || 1),
        fator_atacado
      })
      .returning('id')

    // Normaliza o retorno: se for array de objetos [{ id: 1 }] ou array de IDs [1]
    const insertedId = typeof result[0] === 'object' ? result[0].id : result[0]

    return response.status(201).json({
      id: insertedId,
      message: 'Cartaz cadastrado com sucesso!'
    })
  }

  async show(request, response) {
    const { id } = request.params

    const poster = await knex('posters').where({ id }).first()

    if (!poster) {
      throw new AppError('Cartaz não encontrado.', 404)
    }

    const campaign = await knex('campaigns')
      .where({ id: poster.campaign_id })
      .first()

    const campaign_type = await knex('campaigns_type')
      .where({ id: poster.campaign_type_id })
      .first()

    return response.json({
      ...poster,
      campaign: campaign || null,
      campaign_type: campaign_type || null
    })
  }

  async index(request, response) {
    try {
      // 1 única query com LEFT JOIN para alta performance e sem bugs de promises
      const posters = await knex('posters')
        .select(
          'posters.*',
          'campaigns.name as campaign_name',
          'campaigns.image as campaign_image',
          'campaigns.is_vencimento as campaign_is_vencimento',
          'campaigns_type.name as campaign_type_name'
        )
        .leftJoin('campaigns', 'campaigns.id', 'posters.campaign_id')
        .leftJoin(
          'campaigns_type',
          'campaigns_type.id',
          'posters.campaign_type_id'
        )
        .orderBy('posters.id', 'desc')

      // Normaliza para o formato esperado pelo Front
      const formattedPosters = posters.map(poster => ({
        ...poster,
        status: Number(poster.status ?? 0),
        unit: Number(poster.unit),
        campaign: poster.campaign_id
          ? {
              id: poster.campaign_id,
              name: poster.campaign_name,
              image: poster.campaign_image,
              is_vencimento: poster.campaign_is_vencimento
            }
          : null,
        campaign_type: poster.campaign_type_id
          ? {
              id: poster.campaign_type_id,
              name: poster.campaign_type_name
            }
          : null
      }))

      return response.json(formattedPosters)
    } catch (error) {
      console.error('Erro ao buscar cartazes:', error)
      return response.status(500).json({ message: 'Erro ao buscar cartazes' })
    }
  }

  async update(request, response) {
    const { id } = request.params
    const user_id = request.user.id
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

    const poster = await knex('posters').where({ id }).first()

    if (!poster) {
      throw new AppError('Cartaz não encontrado.', 404)
    }

    try {
      await knex('posters')
        .where({ id })
        .update({
          product_id,
          description,
          complement,
          packaging,
          price,
          price_retail,
          price_wholesale,
          initial_date,
          final_date,
          status: status !== undefined ? Number(status) : poster.status,
          user_id,
          campaign_id,
          campaign_type_id,
          unit: unit !== undefined ? Number(unit) : poster.unit,
          fator_atacado,
          updated_at: knex.fn.now()
        })

      return response
        .status(200)
        .json({ message: 'Cartaz atualizado com sucesso.' })
    } catch (error) {
      console.error('Erro ao atualizar o pôster:', error)
      return response
        .status(500)
        .json({ message: 'Erro ao atualizar o pôster' })
    }
  }

  async updateStatus(request, response) {
    const { id } = request.params
    const { status } = request.body

    try {
      await knex('posters')
        .where({ id })
        .update({ status: Number(status) })

      return response.status(200).send()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      return response
        .status(500)
        .json({ message: 'Erro ao atualizar o status' })
    }
  }

  async delete(request, response) {
    const { id } = request.params

    try {
      let query = knex('posters')

      if (id.includes(',')) {
        const ids = id.split(',').map(Number)
        query = query.whereIn('id', ids)
      } else {
        query = query.where({ id: Number(id) })
      }

      const posters = await query

      if (!posters || posters.length === 0) {
        throw new AppError('Pôster(es) não encontrado(s).', 404)
      }

      await query.delete()

      return response.json({ message: 'Pôster(es) excluído(s) com sucesso.' })
    } catch (error) {
      console.error('Erro ao excluir pôster(es):', error)
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({ error: error.message })
      }
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
