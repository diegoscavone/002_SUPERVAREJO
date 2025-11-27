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
    }
  }
}
