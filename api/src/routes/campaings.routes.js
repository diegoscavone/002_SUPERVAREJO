const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const CampaignController = require('../controllers/CampaignController')
const ImageCampaignController = require('../controllers/ImageCampaignController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const campaignRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const campaignController = new CampaignController()
const imageCampaignController = new ImageCampaignController()

campaignRoutes.use(ensureAuthenticated)

campaignRoutes.post('/',
  upload.single('image'),
  campaignController.create
)
campaignRoutes.get('/image/:id', imageCampaignController.show)

campaignRoutes.get('/', campaignController.index)
campaignRoutes.get('/:id', campaignController.show)
campaignRoutes.delete('/:id', campaignController.delete)
campaignRoutes.get('/details/:id', campaignController.details)

module.exports = campaignRoutes
