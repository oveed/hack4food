const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

router.post('/create', businessController.createBusiness);
router.get('/', businessController.getAllBusinesses);
router.get('/:businessId', businessController.getBusiness);
router.put('/:businessId', businessController.updateBusiness);
router.delete('/:businessId', businessController.deleteBusiness);
router.post('/offer', businessController.makeOffer);
router.get('/:businessId/offers', businessController.getBusinessOffers);

module.exports = router;
