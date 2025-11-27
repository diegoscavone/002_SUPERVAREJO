const knex = require('../database/knex')

class UserRepository {
  //Essa função faz a busca pelo email, verificando se o mesmo já se encontra na base de dados
  async findByUsername(username) {
    const user = await knex('users').where({ username }).first()
    return user
  }

  //Essa função faz a criação do usuário com os parametros name, email e password
  async create({ name, username, password, role, unit }) {
    const userId = await knex('users').insert({
      name,
      username,
      password: password,
      role, 
      unit
    })

    return { id: userId }
  }
}

module.exports = UserRepository
