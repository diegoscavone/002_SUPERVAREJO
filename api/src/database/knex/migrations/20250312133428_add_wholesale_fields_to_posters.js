exports.up = function(knex) {
    return knex.schema.table('posters', table => {
      table.text('price_retail')
      table.text('price_wholesale')
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('posters', table => {
      table.dropColumn('price_retail');
      table.dropColumn('price_wholesale');
    });
  };