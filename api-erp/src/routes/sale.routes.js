const { Router } = require('express')

const SaleController = require('../controllers/SaleController')
const saleRoutes = Router()

const saleController = new SaleController()

saleRoutes.get('/', saleController.show)

module.exports = saleRoutes