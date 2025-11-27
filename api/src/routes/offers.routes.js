const { Router } = require('express')

const OffersPdfController = require('../controllers/OffersPdfController')
const OffersController = require('../controllers/OffersController')
const ProductsOffersController = require('../controllers/ProductsOffersController')

const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const offersRoutes = Router()

const offersPdfController = new OffersPdfController()
const offersController = new OffersController()
const productsOffersController = new ProductsOffersController()

offersRoutes.use(ensureAuthenticated)

// Rotas CRUD para ofertas - CORRIGIDO: removido "/offers" dos caminhos
offersRoutes.post('/', offersController.create)
offersRoutes.get('/', offersController.index)
offersRoutes.get('/:id', offersController.show)
offersRoutes.put('/:id', offersController.update)
offersRoutes.delete('/:id', offersController.delete)

// Rota para gerar PDF
offersRoutes.post('/pdf', offersPdfController.generateOfferPDF)

// Rotas para produtos de ofertas
offersRoutes.post('/products', productsOffersController.create)
offersRoutes.get('/products', productsOffersController.index)
offersRoutes.get('/products/:id', productsOffersController.show)
offersRoutes.put('/products/:id', productsOffersController.update)
offersRoutes.delete('/products/:id', productsOffersController.delete)
offersRoutes.get('/products/statistics', productsOffersController.getStatistics)

module.exports = offersRoutes