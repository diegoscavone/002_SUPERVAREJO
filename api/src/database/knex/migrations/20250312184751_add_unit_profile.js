exports.up = function (knex) {
  return knex.schema.table('users', table => {
    table.text('unit')
  })
}

exports.down = function (knex) {
  return knex.schema.table('users', table => {
    table.text('unit')
  })
}
