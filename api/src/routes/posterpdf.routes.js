const { Router } = require('express')

const PostersPdfController = require('../controllers/PostersPdfController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const posterPdfRouter = Router()

const postersPdfController = new PostersPdfController()

posterPdfRouter.use(ensureAuthenticated)

posterPdfRouter.post('/', postersPdfController.create)

module.exports = posterPdfRouter
