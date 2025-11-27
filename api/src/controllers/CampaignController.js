const knex = require('../database/knex')
const path = require('path')
const fs = require('fs')
const DiskStorage = require('../providers/DiskStorage')
const uploadConfig = require('../configs/upload')
const AppError = require('../utils/AppError')

class CampaignController {
  async create(request, response) {
    const { name } = request.body
    const file = request.file

    // Verifica se o arquivo foi enviado
    if (!file) {
      return response
        .status(400)
        .json({ error: 'Arquivo de imagem é obrigatório' })
    }
    // const imageFilename = path.join(__dirname, '..', 'tmp', 'uploads', file.filename)
    const diskStorage = new DiskStorage()
    const imageFilename = file.filename

    const destinationPath = path.resolve(
      uploadConfig.UPLOADS_FOLDER,
      imageFilename
    )

    await diskStorage.saveFile(file.path, destinationPath)

    await knex('campaigns').insert({
      name,
      image: file.filename
    })

    // fs.unlinkSync(file.path)

    return response.json()
  }

  async index(request, response) {
    const campaigns = await knex('campaigns').select('*')
    return response.json(campaigns)
  }

  async show(request, response) {
    try {
      const { id } = request.params
      const campaign = await knex('campaigns').where({ id }).first()

      if (!campaign || !campaign.image) {
        return response.status(404).json({ error: 'Imagem não encontrada' })
      }

      const campaignFileName = path.join(
        __dirname,
        '..',
        'tmp',
        'uploads',
        campaign.image
      )

      if (!fs.existsSync(campaignFileName)) {
        return response.status(404).json({ error: 'Imagem não encontrada' })
      }

      return response.sendFile(campaignFileName)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async delete(request, response) {
    const { id } = request.params

    const campaign = await knex('campaigns').where({ id }).first()

    if (!campaign) {
      return response.status(404).json({ error: 'Campanha não encontrada' })
    }

    const diskStorage = new DiskStorage()
    await diskStorage.deleteFile(campaign.image)

    await knex('campaigns').where({ id }).delete()

    return response.json()
  }

  async details(request, response) {
    const { id } = request.params

    try {
      const campaign = await knex('campaigns').where({ id }).first()

      if (!campaign) {
        throw new AppError('Campanha não encontrada')
      }

      return response.json(campaign)
    } catch (error) {
      console.error(error)
      throw new AppError('Erro ao buscar detalhes da campanha')
    }
  }
}

module.exports = CampaignController
