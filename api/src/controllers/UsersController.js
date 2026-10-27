const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')

const UserRepository = require('../repositories/UserRepository')
const UserCreateService = require('../repositories/UserCreateService')
const knex = require('../database/knex')

class UsersController {
  async create(request, response) {
    const { name, username, password, role, unit } = request.body

    const formattedUnit = unit ? String(unit).padStart(3, '0') : unit

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)

    await userCreateService.execute({
      name,
      username,
      password,
      role,
      unit: formattedUnit
    })

    return response.status(201).json()
  }

  // ---------------------------------------------------------------------------
  // FLUXO 1: ADMIN EDITANDO QUALQUER USUÁRIO (VIA ID NA ROTA: PUT /users/:id)
  // ---------------------------------------------------------------------------
  async updateUserData(request, response) {
    const { name, username, password, role, unit } = request.body
    const { id } = request.params

    // 1. Apenas administradores podem acessar este método
    if (request.user.role !== 'admin') {
      throw new AppError('Acesso não autorizado. Apenas administradores podem alterar estes dados.', 403)
    }

    if (!id) {
      throw new AppError('ID do usuário é obrigatório.', 400)
    }

    const user = await knex('users').where({ id }).first()

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    // 2. Verifica se o novo username já está em uso por outro ID
    if (username && username !== user.username) {
      const userWithUpdatedUsername = await knex('users')
        .where({ username })
        .first()

      if (userWithUpdatedUsername && Number(userWithUpdatedUsername.id) !== Number(id)) {
        throw new AppError('Este nome de usuário já está em uso por outro operador.', 400)
      }
    }

    const formattedUnit =
      unit !== undefined && unit !== null && String(unit).trim() !== '' && unit !== 'none'
        ? String(unit).padStart(3, '0')
        : user.unit

    const updateData = {
      name: name ?? user.name,
      username: username ?? user.username,
      role: role ?? user.role, // Admin tem permissão para alterar a role
      unit: formattedUnit,
      updated_at: knex.fn.now()
    }

    // 3. Admin redefine a senha sem precisar de senha antiga
    if (password && String(password).trim() !== '') {
      if (String(password).length < 6) {
        throw new AppError('A nova senha deve ter no mínimo 6 caracteres.', 400)
      }
      updateData.password = await hash(password, 8)
    }

    await knex('users').where({ id }).update(updateData)

    return response.status(200).json({ message: 'Usuário atualizado com sucesso!' })
  }

  // ---------------------------------------------------------------------------
  // FLUXO 2: USUÁRIO COMUM ALTERANDO SEU PRÓPRIO PERFIL (PUT /users)
  // ---------------------------------------------------------------------------
  async update(request, response) {
    const { name, username, password, old_password } = request.body
    const id = request.user.id // Pega sempre o ID do token JWT

    const user = await knex('users').where({ id }).first()

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404)
    }

    // 1. Verifica duplicidade de username
    if (username && username !== user.username) {
      const userWithUpdatedUsername = await knex('users')
        .where({ username })
        .first()

      if (userWithUpdatedUsername && Number(userWithUpdatedUsername.id) !== Number(id)) {
        throw new AppError('Este nome de usuário já está cadastrado!', 400)
      }
    }

    // 2. Garante que campos sensíveis NÃO sejam sobrescritos pelo usuário comum
    const updateData = {
      name: name ?? user.name,
      username: username ?? user.username,
      role: user.role, // Congela o perfil atual
      unit: user.unit, // Mantém a unidade original
      updated_at: knex.fn.now()
    }

    let passwordChanged = false

    // 3. Validação de senha: exige old_password
    if (password && !old_password) {
      throw new AppError('Você precisa informar a senha antiga para definir uma nova senha.', 400)
    }

    if (password && old_password) {
      if (String(password).length < 6) {
        throw new AppError('A nova senha deve ter no mínimo 6 caracteres.', 400)
      }

      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere.', 400)
      }

      updateData.password = await hash(password, 8)
      passwordChanged = true
    }

    await knex('users').where({ id }).update(updateData)

    if (passwordChanged) {
      return response.status(200).json({
        message: 'Senha alterada com sucesso! Faça login novamente.',
        requireLogout: true
      })
    }

    return response.status(200).json({ message: 'Perfil atualizado com sucesso!' })
  }

  async show(request, response) {
    try {
      const { id } = request.params
      const user = await knex('users').where({ id }).first()

      if (!user) {
        return response.status(404).json({ error: 'Usuário não encontrado.' })
      }

      // Nunca retorne o hash da senha por segurança
      delete user.password

      return response.json(user)
    } catch (error) {
      console.error(error)
      return response.status(500).json({ error: 'Erro interno do servidor.' })
    }
  }

  async index(request, response) {
    const users = await knex('users')
      .select('id', 'name', 'username', 'role', 'unit', 'created_at', 'updated_at')
      .orderBy('name', 'asc')

    return response.json(users)
  }

  async delete(request, response) {
    const { id } = request.params

    if (request.user.role !== 'admin') {
      throw new AppError('Acesso negado. Apenas administradores podem excluir usuários.', 403)
    }

    if (Number(request.user.id) === Number(id)) {
      throw new AppError('Você não pode excluir sua própria conta.', 400)
    }

    try {
      await knex('users').where({ id }).delete()
      return response.status(200).json({ message: 'Usuário excluído com sucesso!' })
    } catch (error) {
      throw new AppError('Erro ao excluir usuário.')
    }
  }
}

module.exports = UsersController