const { Router } = require('express')

const ProductController = require('../controllers/ProductController')

const productRoutes = Router()

const productController = new ProductController()

productRoutes.get('/all', productController.listAll)
productRoutes.get('/', productController.show)
productRoutes.get('/:id', productController.index)


module.exports = productRoutes
