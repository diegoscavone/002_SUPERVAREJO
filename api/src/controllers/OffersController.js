const knex = require('../database/knex')
const AppError = require('../utils/AppError')

class OffersController {
  // Criar uma nova oferta e adicionar produtos
  async create(request, response) {
    const { name, products, initial_date, final_date, unit } = request.body
    const user_id = request.user.id
  
    // Validações
    if (!name) {
      throw new AppError("Nome da oferta é obrigatório")
    }
  
    if (!initial_date || !final_date) {
      throw new AppError("Datas inicial e final são obrigatórias")
    }
  
    // Verificar se products é um array válido
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new AppError("É necessário adicionar pelo menos um produto à oferta")
    }
  
    // Garantir que cada produto no array tenha a estrutura esperada
    for (const product of products) {
      if (!product || typeof product !== 'object') {
        throw new AppError("Formato de produto inválido")
      }
      if (!product.product_id) {
        throw new AppError("Um dos produtos não possui ID válido")
      }
    }
  
    try {
      // Criar a oferta e obter o ID de forma segura, independente do banco de dados
      const offerData = {
        name,
        initial_date,
        final_date,
        unit,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      }
      
      // Três abordagens diferentes para obter o ID inserido, dependendo do banco de dados
      let offer_id;
      try {
        // Abordagem 1: Para MySQL e PostgreSQL
        const result = await knex('offers').insert(offerData).returning('id');
        offer_id = result[0].id || result[0]; // PostgreSQL retorna objeto, MySQL pode retornar apenas o ID
      } catch (error) {
        try {
          // Abordagem 2: Para SQLite e outros
          const result = await knex('offers').insert(offerData);
          offer_id = result[0]; // SQLite retorna o ID diretamente
        } catch (insertError) {
          // Abordagem 3: Fallback - inserir e depois buscar o último ID
          await knex('offers').insert(offerData);
          const lastOffer = await knex('offers')
            .orderBy('id', 'desc')
            .first();
          
          offer_id = lastOffer.id;
        }
      }
  
      // Verificar se temos um ID válido
      if (!offer_id) {
        throw new AppError("Erro ao obter o ID da oferta criada");
      }
  
      console.log(`Oferta criada com ID: ${offer_id}`);
  
      // Preparar os produtos para inserção
      const productsToInsert = products.map(product => {
        return {
          product_id: product.product_id,
          description: product.description || '',
          cost: product.cost || '0',
          price: product.price || '0',
          offer: product.offer || '0',
          profit: product.profit || '0',
          unit: product.unit || '',
          user_id,
          offer_id,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now()
        }
      });
  
      // Inserir os produtos da oferta
      await knex('products_offers').insert(productsToInsert);
  
      return response.status(201).json({ 
        message: "Oferta criada com sucesso", 
        offer_id 
      });
    } catch (error) {
      console.error("Erro na criação da oferta:", error);
      throw new AppError(`Erro ao criar oferta: ${error.message}`);
    }
  }

  // Listar todas as ofertas
  async index(request, response) {
    const offers = await knex('offers')
      .select('*')
      .orderBy('created_at', 'desc')

    return response.json(offers)
  }

  // Buscar uma oferta específica com seus produtos
  async show(request, response) {
    const { id } = request.params

    // Buscar a oferta
    const offer = await knex('offers').where({ id }).first()

    if (!offer) {
      throw new AppError("Oferta não encontrada", 404)
    }

    // Buscar os produtos da oferta
    const products = await knex('products_offers')
      .where({ offer_id: id })
      .select('*')

    return response.json({
      ...offer,
      products
    })
  }

  // Atualizar uma oferta
  async update(request, response) {
    const { id } = request.params
    const { name, initial_date, final_date } = request.body

    // Verificar se a oferta existe
    const offerExists = await knex('offers').where({ id }).first()

    if (!offerExists) {
      throw new AppError("Oferta não encontrada", 404)
    }

    // Validar datas se forem fornecidas
    if (initial_date && final_date) {
      const initialDateValid = Date.parse(initial_date)
      const finalDateValid = Date.parse(final_date)

      if (isNaN(initialDateValid) || isNaN(finalDateValid)) {
        throw new AppError("Formato de data inválido")
      }

      if (new Date(initial_date) > new Date(final_date)) {
        throw new AppError("A data final deve ser posterior à data inicial")
      }
    }

    // Atualizar a oferta
    await knex('offers')
      .where({ id })
      .update({
        name,
        ...(initial_date && { initial_date }),
        ...(final_date && { final_date }),
        updated_at: knex.fn.now()
      })

    return response.json({ message: "Oferta atualizada com sucesso" })
  }

  // Excluir uma oferta
  async delete(request, response) {
    const { id } = request.params

    // Verificar se a oferta existe
    const offerExists = await knex('offers').where({ id }).first()

    if (!offerExists) {
      throw new AppError("Oferta não encontrada", 404)
    }

    // Inicia uma transação
    const trx = await knex.transaction()

    try {
      // Excluir os produtos da oferta
      await trx('products_offers').where({ offer_id: id }).delete()
      
      // Excluir a oferta
      await trx('offers').where({ id }).delete()

      // Commit da transação
      await trx.commit()

      return response.json({ message: "Oferta excluída com sucesso" })
    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback()
      throw new AppError("Erro ao excluir oferta: " + error.message)
    }
  }

  // Gerar PDF da oferta (apenas um esboço - implementação completa depende da biblioteca usada)
  async generatePDF(request, response) {
    const { produtos, unidade } = request.body
    const user_id = request.user.id

    // Validações
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      throw new AppError("É necessário ter produtos para gerar o PDF")
    }

    try {
      // Aqui você implementaria a lógica de geração do PDF
      // usando bibliotecas como PDFKit, jsPDF (no frontend) ou similar

      // Para este exemplo, assumimos que o PDF seria gerado e enviado como resposta
      return response.json({ 
        message: "PDF gerado com sucesso",
        // url: "/caminho/para/o/pdf/gerado.pdf" 
      })
    } catch (error) {
      throw new AppError("Erro ao gerar PDF: " + error.message)
    }
  }
}

module.exports = OffersController