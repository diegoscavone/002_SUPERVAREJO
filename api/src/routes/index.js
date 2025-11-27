const { Router } = require('express')

const usersRouter = require('./user.routes')
const sessionsRouter = require('./sessions.routes')
const postersRouter = require('./posters.routes')
const campaignRouter = require('./campaings.routes')
const campaignTypeRouter = require('./campaingsType.routes')
const imageCampaignRouter = require('./imagecampaings.routes')
const posterPDFRouter = require('./posterpdf.routes')
const offersRouter = require('./offers.routes')
const productsValidityRouter = require('./productsvalidity.routes')

const routes = Router()

routes.use('/users', usersRouter)
routes.use('/sessions', sessionsRouter)
routes.use('/posters', postersRouter)
routes.use('/campaigns', campaignRouter)
routes.use('/campaign-image', imageCampaignRouter)
routes.use('/campaigns-type', campaignTypeRouter)
routes.use('/posters-pdf', posterPDFRouter)
routes.use('/offers', offersRouter)
routes.use('/productsValidity', productsValidityRouter)

module.exports = routes
