const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/create', bookingController.createBooking);
router.post('/addStudent', bookingController.addStudentToBooking);
router.post('/removeStudent', bookingController.removeStudentFromBooking);
router.get('/:bookingId', bookingController.getBooking);
router.get('/', bookingController.getAllBookings);
router.put('/:bookingId', bookingController.updateBooking);
router.delete('/:bookingId', bookingController.deleteBooking);

module.exports = router;
