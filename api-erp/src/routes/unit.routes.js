const { Router } = require('express')

const UnitController = require('../controllers/UnitController')
const unitRoutes = Router()

const unitController = new UnitController()

unitRoutes.get('/', unitController.show)

module.exports = unitRoutes