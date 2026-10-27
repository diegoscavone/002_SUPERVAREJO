const { verify } = require('jsonwebtoken')
const authConfig = require('../configs/auth')

function ensureAuthenticated(request, response, next) {
  // Lê diretamente do cookie-parser
  const token = request.cookies?.token

  if (!token) {
    return response.status(401).json({ message: 'Sessão não autorizada ou expirada.' })
  }

  try {
    const { sub: user_id, role } = verify(token, authConfig.jwt.secret)

    request.user = {
      id: Number(user_id),
      role
    }

    return next()
  } catch {
    return response.status(401).json({ message: 'JWT Token inválido ou expirado.' })
  }
}

module.exports = ensureAuthenticated