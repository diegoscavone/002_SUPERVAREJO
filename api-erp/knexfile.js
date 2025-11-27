module.exports =  {
  development: {
    client: 'postgresql',
    connection: {
      host: '192.168.0.197',
      port: 5432,
      user: 'diegoscavone',
      password: 'princesa@33',
      database: 'erp'
    },
  
    pool: {
      min: 0,
      max: 5,
    }
  }
}
