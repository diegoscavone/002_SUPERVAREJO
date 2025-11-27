const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const ImageCampaignController = require('../controllers/ImageCampaignController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const campaignImageRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const imageCampaignController = new ImageCampaignController()

campaignImageRoutes.use(ensureAuthenticated)

campaignImageRoutes.get('/:id', imageCampaignController.show)
campaignImageRoutes.patch(
  '/:id',
  upload.single('image'),
  imageCampaignController.update
)

module.exports = campaignImageRoutes
