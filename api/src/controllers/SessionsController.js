const knex = require('../database/knex')
const AppError = require('../utils/AppError')
const { compare } = require('bcryptjs')
const authConfig = require('../configs/auth')
const { sign } = require('jsonwebtoken')

class SessionsController {
  async create(request, response) {
    const { username, password, remember } = request.body
    const user = await knex('users').where({ username }).first()

    if (!user) {
      throw new AppError('Usuário e/ou senha incorreta.', 401)
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched) {
      throw new AppError('Usuário e/ou senha incorreta.', 401)
    }

    const { secret } = authConfig.jwt
    const expiresIn = remember ? '1d' : '1h'
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    })

    const maxAge = remember ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000

    response.cookie('token', token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: false,
      maxAge
    })

    delete user.password

    return response.json({ user })
  }
}

module.exports = SessionsController
