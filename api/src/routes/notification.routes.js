const { Router } = require('express')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const NotificationController = require('../controllers/NotificationController')

const notificationRoutes = Router()
const controller = new NotificationController()

notificationRoutes.get('/push/public-key', controller.getPublicKey)
notificationRoutes.post(
  '/push/subscribe',
  ensureAuthenticated,
  controller.subscribe
)

module.exports = notificationRoutes
