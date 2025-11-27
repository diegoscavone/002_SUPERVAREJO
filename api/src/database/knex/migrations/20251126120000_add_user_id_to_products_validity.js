
exports.up = knex =>
  knex.schema.table('productsValidity', table => {
    table.integer('user_id').references('id').inTable('users');
  });

exports.down = knex =>
  knex.schema.table('productsValidity', table => {
    table.dropColumn('user_id');
  });
