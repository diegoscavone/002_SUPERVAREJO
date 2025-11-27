const { Router } = require('express')

const saleRouter = require('./sale.routes')
const productRouter = require('./products.routes')
const unitRouter = require('./unit.routes')

const routes = Router()
routes.use('/posters', saleRouter)
routes.use('/products', productRouter)
routes.use('/units', unitRouter)

module.exports = routes
