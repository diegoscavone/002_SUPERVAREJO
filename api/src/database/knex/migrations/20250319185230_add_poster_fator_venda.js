exports.up = function (knex) {
  return knex.schema.table('posters', table => {
    table.text('fator_atacado')
  })
}

exports.down = function (knex) {
  return knex.schema.table('posters', table => {
    table.text('fator_atacado')
  })
}
