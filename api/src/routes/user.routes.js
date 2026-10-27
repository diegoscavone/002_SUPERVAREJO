const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const UsersController = require('../controllers/UsersController')
const UsersValidatedController = require('../controllers/UsersValidatedController')
const UsersAvatarController = require('../controllers/UsersAvatarController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const usersRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const usersController = new UsersController()
const usersValidatedController = new UsersValidatedController()
const usersAvatarController = new UsersAvatarController()

// 1. Rota pública de criação
usersRoutes.post('/', usersController.create)

// 2. Middleware de autenticação JWT para tudo abaixo
usersRoutes.use(ensureAuthenticated)

// 3. Rota estática de validação (ANTES de /:id)
usersRoutes.get('/validated', usersValidatedController.index)

// 4. Rotas de perfil do usuário logado
usersRoutes.get('/', usersController.index)
usersRoutes.put('/', usersController.update)
usersRoutes.patch(
  '/avatar',
  upload.single('avatar'),
  usersAvatarController.update
)

// 5. Rotas parametrizadas por ID (SEMPRE NO FINAL)
usersRoutes.get('/:id', usersController.show)
usersRoutes.put('/:id', usersController.updateUserData)
usersRoutes.delete('/:id', usersController.delete)

module.exports = usersRoutes
