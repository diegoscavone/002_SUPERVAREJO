const knex = require('../database/knex')
const AppError = require('../utils/AppError')
const DiskStorage = require('../providers/DiskStorage')
const uploadConfig = require('../configs/upload')
const path = require('path')
const fs = require('fs')

class ImageCampaignController {
  async update(request, response) {
    try {
      const user_id = request.user.id
      const campaign_id = request.params.id
      const { name } = request.body
      const diskStorage = new DiskStorage()

      // Validação de autenticação
      if (!user_id) {
        throw new AppError(
          'Somente usuários autenticados podem alterar a imagem de um cartaz!',
          401
        )
      }
      const campaign = await knex('campaigns').where({ id: campaign_id }).first()
      
      if (!campaign) {
        throw new AppError('Campanha não encontrada!', 404)
      }

      let imageFilename = campaign.image // Manter imagem atual como padrão

      // Se uma nova imagem foi enviada
      if (request.file) {
        // Deletar imagem anterior se existir
        if (campaign.image) {
          await diskStorage.deleteFile(campaign.image)
        }
        // Passar apenas o filename, não o objeto completo
        imageFilename = request.file.filename // Use diretamente o filename
        
        // Verificar se arquivo existe na pasta configurada
        const fullPath = path.join(uploadConfig.UPLOADS_FOLDER, imageFilename)
      }

      // Atualizar dados no banco
      const updatedCampaign = await knex('campaigns')
        .where({ id: campaign_id })
        .update({
          name: name || campaign.name, // Manter nome atual se não foi fornecido
          image: imageFilename,
          updated_at: knex.fn.now()
        })
        .returning('*') // Para PostgreSQL
        
      // Para MySQL/SQLite, buscar o registro atualizado
      const finalCampaign = await knex('campaigns').where({ id: campaign_id }).first()

      return response.json({
        message: 'Campanha atualizada com sucesso!',
        campaign: finalCampaign
      })

    } catch (error) {
      console.error('Erro no ImageCampaignController.update:', error)
      
      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          status: 'error',
          message: error.message
        })
      }

      return response.status(500).json({
        status: 'error',
        message: 'Erro interno do servidor'
      })
    }
  }

  async show(request, response) {
    try {
      const { id } = request.params
           
      // Buscar campanha para obter nome do arquivo
      const campaign = await knex('campaigns').where({ id }).first()
      
      if (!campaign || !campaign.image) {
        return response.status(404).json({ error: 'Imagem não encontrada.' })
      }

      const campaignFileName = path.join(
        uploadConfig.UPLOADS_FOLDER,
        campaign.image
      )

      if (!fs.existsSync(campaignFileName)) {
        return response.status(404).json({ error: 'Arquivo de imagem não encontrado.' })
      }
      return response.sendFile(path.resolve(campaignFileName))
      
    } catch (error) {
      console.error('Erro no ImageCampaignController.show:', error)
      return response.status(500).json({ error: 'Erro ao processar imagem.' })
    }
  }
}

module.exports = ImageCampaignController