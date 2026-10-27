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

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({ role: user.role }, secret, {
      subject: String(user.id),
      expiresIn: '1d'
    })

    const oneDayInMs = 24 * 60 * 60 * 1000

    response.cookie('token', token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneDayInMs
    })

    delete user.password

    return response.json({ user })
  }

  async delete(request, response) {
    response.clearCookie('token', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    return response
      .status(200)
      .json({ message: 'Logout efetuado com sucesso.' })
  }
}

module.exports = SessionsController
