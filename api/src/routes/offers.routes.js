const { Router } = require('express')

const OffersPdfController = require('../controllers/OffersPdfController')
const OffersController = require('../controllers/OffersController')
const ProductsOffersController = require('../controllers/ProductsOffersController')
const OfferDraftsController = require('../controllers/OfferDraftsController')

const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const offersRoutes = Router()

const offersPdfController = new OffersPdfController()
const offersController = new OffersController()
const productsOffersController = new ProductsOffersController()
const offerDraftsController = new OfferDraftsController()

// Aplica autenticação em todas as rotas deste arquivo
offersRoutes.use(ensureAuthenticated)

// --- Rotas CRUD para Ofertas (Principais) ---
offersRoutes.post('/', offersController.create)
offersRoutes.get('/', offersController.index)
offersRoutes.get('/:id', offersController.show)
offersRoutes.put('/:id', offersController.update)
offersRoutes.delete('/:id', offersController.delete)

// --- Rota para gerar PDF ---
offersRoutes.post('/pdf', offersPdfController.generateOfferPDF)

// --- Rotas para Itens de Ofertas já finalizadas ---
offersRoutes.post('/products', productsOffersController.create)
offersRoutes.get('/products', productsOffersController.index)
offersRoutes.get('/products/statistics', productsOffersController.getStatistics)
offersRoutes.get('/products/:id', productsOffersController.show)
offersRoutes.put('/products/:id', productsOffersController.update)
offersRoutes.delete('/products/:id', productsOffersController.delete)

// --- Rotas para Rascunho (Draft) - Sincronização em Rede ---
offersRoutes.get('/draft/:unit', offerDraftsController.index)
offersRoutes.post('/draft', offerDraftsController.save)
offersRoutes.delete('/draft/:id', offerDraftsController.delete)
offersRoutes.delete('/draft/all/:unit', offerDraftsController.clear)

module.exports = offersRoutes
