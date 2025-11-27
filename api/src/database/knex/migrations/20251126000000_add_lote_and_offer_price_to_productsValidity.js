
exports.up = knex =>
  knex.schema.table('productsValidity', table => {
    table.text('lote');
    table.decimal('offer_price', 10, 2);
  });

exports.down = knex =>
  knex.schema.table('productsValidity', table => {
    table.dropColumn('lote');
    table.dropColumn('offer_price');
  });
