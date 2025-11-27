exports.up = function (knex) {
    return knex.schema.table('offers', table => {
        table.timestamp('initial_date')
        table.timestamp('final_date')
    })
  }
  
  exports.down = function (knex) {
    return knex.schema.table('offers', table => {
        table.timestamp('initial_date')
        table.timestamp('final_date')
    })
  }
  