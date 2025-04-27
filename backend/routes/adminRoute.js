const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.patch('/approve/:offerId', adminController.approveOffer);
router.patch('/reject/:offerId', adminController.rejectOffer);
router.get('/offers', adminController.getAllOffers);

module.exports = router;
