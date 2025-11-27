const { Router } = require('express')

const PostersController = require('../controllers/PostersController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const postersRoutes = Router()

const postersController = new PostersController()

postersRoutes.use(ensureAuthenticated)

postersRoutes.post('/', postersController.create)
postersRoutes.put('/:id', postersController.update)
postersRoutes.put('/:id', postersController.updateStatus)
postersRoutes.get('/:id', postersController.show)
postersRoutes.get('/', postersController.index)
postersRoutes.delete('/:id', postersController.delete)

module.exports = postersRoutes
