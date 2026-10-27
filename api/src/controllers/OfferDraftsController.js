const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class OfferDraftsController {
  // Lista todos os itens do rascunho de uma unidade específica
  async index(request, response) {
    const { unit } = request.params

    const drafts = await knex('offer_drafts')
      .where({ unit })
      .orderBy('created_at', 'desc')

    return response.json(drafts)
  }

  // Adiciona ou Atualiza um item no rascunho
  async save(request, response) {
    const {
      product_id,
      description,
      barcode,
      unit,
      cost_price,
      sale_price,
      offer_price,
      user_id
    } = request.body

    // 1. Verifica se o produto já está no rascunho desta unidade
    const existingItem = await knex('offer_drafts')
      .where({ product_id, unit })
      .first()

    if (existingItem) {
      // 2. Se já existe, atualiza os dados.
      // Dica Senior: Atualizamos também custo e venda caso tenham mudado no ERP
      await knex('offer_drafts').where({ id: existingItem.id }).update({
        offer_price,
        cost_price,
        sale_price,
        user_id, // Atualiza quem mexeu por último
        updated_at: knex.fn.now()
      })

      return response.json({ message: 'Item atualizado no rascunho' })
    }

    // 3. Se não existe, insere novo
    await knex('offer_drafts').insert({
      product_id,
      description,
      barcode,
      unit,
      cost_price,
      sale_price,
      offer_price,
      user_id
    })

    return response.status(201).json({ message: 'Item adicionado ao rascunho' })
  }

  // Remove um item específico do rascunho
  // Ajustado para aceitar product_id via query para facilitar o front
  async delete(request, response) {
    const { id } = request.params // Pode vir o id ou o código do produto
    const { unit } = request.query
    const user_id = request.user?.id

    if (!id) {
      throw new AppError(
        'Identificador do produto é obrigatório para exclusão.',
        400
      )
    }

    // Monta a query garantindo remoção por product_id ou id primário
    const query = knex('offer_drafts').where(function () {
      this.where({ product_id: String(id) }).orWhere({ id: String(id) })
    })

    // Se a unidade for informada, filtra por ela
    if (unit) {
      query.andWhere({ unit: String(unit) })
    }

    const rowsDeleted = await query.delete()

    if (rowsDeleted === 0) {
      // Opcional para debug: throw new AppError("Item não encontrado no rascunho", 404);
      console.warn(
        `[Draft] Nenhum rascunho deletado para o ID: ${id} na unidade: ${unit}`
      )
    }

    return response.status(204).send()
  }

  // Limpa todo o rascunho de uma unidade (após salvar a oferta final ou cancelar)
  async clear(request, response) {
    const { unit } = request.params

    if (!unit) {
      throw new AppError('Unidade não informada para limpeza do rascunho.')
    }

    await knex('offer_drafts').where({ unit }).delete()

    return response.json({ message: 'Rascunho limpo com sucesso' })
  }
}

module.exports = OfferDraftsController
