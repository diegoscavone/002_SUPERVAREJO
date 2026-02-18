/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('offer_drafts', (table) => {
    table.increments('id').primary();
    
    // Identificação do Produto e Loja
    table.string('product_id').notNullable();
    table.string('description').notNullable();
    table.string('barcode');
    table.string('unit').notNullable(); // Código da Unidade/Filial
    
    // Valores (armazenamos como decimal para precisão matemática no backend)
    table.decimal('cost_price', 10, 2).defaultTo(0);
    table.decimal('sale_price', 10, 2).defaultTo(0);
    table.decimal('offer_price', 10, 2).defaultTo(0);
    
    // Controle de Usuário e Sessão
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    
    // Campos de Auditoria
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Índices para performance em rede
    table.index(['unit', 'product_id']); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('offer_drafts');
};