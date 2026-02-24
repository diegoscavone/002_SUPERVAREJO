/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('campaigns', table => {
    // Flag para identificar se é uma campanha de vencimento (ex: oculta datas de validade da campanha e mostra do produto)
    table.boolean('is_vencimento').defaultTo(false).notNullable();
    
    // Flag para identificar se o preço é obrigatório (ex: campanhas institucionais podem não exigir preço)
    table.boolean('is_price_required').defaultTo(true).notNullable();
    
    // Dica de Sênior: Se no futuro você quiser agrupar comportamentos, 
    // essa coluna 'behavior' ajuda a evitar muitos booleanos
    // table.string('behavior').defaultTo('normal'); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('campaigns', table => {
    table.dropColumn('is_vencimento');
    table.dropColumn('is_price_required');
  });
};