const path = require('path')
require('dotenv').config()

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '192.168.0.198',
      port: '6432',
      database: 'princesa',
      user: 'diego',
      password: 'princesa@33'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.resolve(
        __dirname,
        'src',
        'database',
        'knex',
        'migrations'
      )
    },
    seeds: {
      directory: path.resolve(__dirname, 'src', 'database', 'knex', 'seeds')
    },

    production: {
      client: 'postgresql',
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE_PROD,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: path.resolve(
          __dirname,
          'src',
          'database',
          'knex',
          'migrations'
        )
      },
      seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'knex', 'seeds')
      }
    }
  }
}
