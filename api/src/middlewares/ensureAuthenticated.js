const { verify } = require('jsonwebtoken')
const AppError = require('../utils/AppError')
const authConfig = require('../configs/auth')

function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers

  if (!authHeader.cookie) {
    return response.status(401).json({ message: 'Sessão Expirada' })
  }

  const [, token] = authHeader.cookie.split('token=')

  try {
    const { sub: user_id } = verify(token, authConfig.jwt.secret)

    request.user = {
      id: Number(user_id)
    }
    return next()
  } catch {
    return response.status(401).json({ message: 'JWT Token inválido' })
  }
}

module.exports = ensureAuthenticated
