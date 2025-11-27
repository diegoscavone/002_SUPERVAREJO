const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const UserRepository = require('../repositories/UserRepository')
const UserCreateService = require('../repositories/UserCreateService')

const knex = require('../database/knex')

class UsersController {
  async create(request, response) {
    const { name, username, password, role, unit } = request.body
    
    // Garantir que unit sempre seja formatado com 3 dígitos
    const formattedUnit = unit ? String(unit).padStart(3, '0') : unit

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)

    await userCreateService.execute({ name, username, password, role, unit: formattedUnit })

    return response.status(201).json()
  }

  async updateUserData(request, response) {
    const { name, username, password, role, unit } = request.body
    
    // Garantir que unit sempre seja formatado com 3 dígitos
    const formattedUnit = unit ? String(unit).padStart(3, '0') : unit
    const user_id = request.user.id
    const id = request.params.id ? request.params.id : user_id

    const user = await knex('users').where({ id }).first()

    const formatedTimestamp = () => {
      const d = new Date()
      const date = d.toISOString().split('T')[0]
      const time = d.toTimeString().split(' ')[0]
      return `${date} ${time}`
    }

    if (!user) {
      throw new AppError('Usuário não encontrado.')
    }

    user.name = name ?? user.name
    user.username = username ?? user.username
    user.role = role ?? user.role
    user.unit = formattedUnit ?? user.unit

    if(password) {
      user.password = await hash(password, 8)
    }

    await knex('users').where({ id }).update({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      unit: user.unit,
      updated_at: formatedTimestamp()
    })
    return response.json()
  }

  async update(request, response) {
    const { name, username, password, old_password, role, unit } = request.body
    
    // Garantir que unit sempre seja formatado com 3 dígitos
    const formattedUnit = unit ? String(unit).padStart(3, '0') : unit
    const id = request.user.id

    const user = await knex('users').where({ id }).first()

    if (!user) {
      throw new AppError('Usuário não encontrado.')
    }

    const userWithUpdatedUsername = await knex('users')
      .where({ username })
      .first()

    if (userWithUpdatedUsername && userWithUpdatedUsername.id !== user.id) {
      throw new AppError('Usuário já está cadastrado!')
    }

    user.name = name ?? user.name
    user.username = username ?? user.username
    user.role = role ?? user.role
    user.unit = formattedUnit ?? user.unit

    let passwordChanged = false

    if (password && !old_password) {
      throw new AppError(
        'Você precisa informar a senha antiga para definir a nova senha'
      )
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere')
      }

      user.password = await hash(password, 8)
      passwordChanged = true
    } 

    await knex('users').where({ id }).update({
      name: name,
      username: username,
      password: user.password,
      role: user.role,
      unit: user.unit,
    })

    if(passwordChanged){
      return response.status(200).json({ message: 'Senha alterada, faça login novamente', requireLogout: true })
    }
    return response.json()
  }
  async show(request, response) {
    try {
      const { id } = request.params
      const user = await knex('users').where({ id }).first()

      if (!user) {
        return response.status(404).json({ error: 'Usuário não encontrado.' })
      }

      return response.json(user)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  async index(request, response){
    const users = await knex('users')

    return response.json(users)
  }

  async delete(request, response) {
    const { id } = request.params
    try {
      await knex('users').where({ id }).delete()
      response.json('Usuário excluído com sucesso!').status(200)
    } catch (error) {
      throw new AppError('Erro ao excluir usuário')
    }

  }
}

module.exports = UsersController