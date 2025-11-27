const { Router } = require('express')

const CampaignTypeController = require('../controllers/CampaignTypeController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const campaignTypeRoutes = Router()

const campaignTypeController = new CampaignTypeController()

campaignTypeRoutes.use(ensureAuthenticated)

campaignTypeRoutes.post('/', campaignTypeController.create)
campaignTypeRoutes.get('/', campaignTypeController.index)
campaignTypeRoutes.get('/:id', campaignTypeController.show)

module.exports = campaignTypeRoutes
