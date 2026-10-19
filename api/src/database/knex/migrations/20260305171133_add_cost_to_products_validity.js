/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('productsValidity', table => {
    // Adiciona a coluna de custo com 2 casas decimais e padrão 0
    table.decimal('cost', 10, 2).defaultTo(0).after('price');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('productsValidity', table => {
    table.dropColumn('cost');
  });
};