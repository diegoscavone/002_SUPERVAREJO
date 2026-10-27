const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const UsersController = require('../controllers/UsersController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const UsersValidatedController = require('../controllers/UsersValidatedController')
const UsersAvatarController = require('../controllers/UsersAvatarController')

const usersRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const usersController = new UsersController()
const usersValidatedController = new UsersValidatedController()
const usersAvatarController = new UsersAvatarController()


usersRoutes.post('/', usersController.create)

usersRoutes.get(
  '/validated',
  ensureAuthenticated,
  usersValidatedController.index
)

usersRoutes.get('/', ensureAuthenticated, usersController.index)
usersRoutes.put('/', ensureAuthenticated, usersController.update)
usersRoutes.patch(
    '/avatar',
    ensureAuthenticated,
    upload.single('avatar'),
    usersAvatarController.update
  )
usersRoutes.get('/:id', usersController.show)
usersRoutes.put('/:id', ensureAuthenticated, usersController.updateUserData)
usersRoutes.delete('/:id', ensureAuthenticated, usersController.delete)

module.exports = usersRoutes
