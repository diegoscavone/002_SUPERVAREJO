const knex = require('../database/knex')

class UnitController {
  async show(request, response) {
    const unit = await knex
      .select('unid_codigo', 'unid_reduzido')
      .from('unidades')

    return response.json(unit)
  }
}

module.exports = UnitController
