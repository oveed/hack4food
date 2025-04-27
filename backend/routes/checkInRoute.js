const express = require('express');
const router = express.Router();
const checkInController = require('../controllers/checkInController');

router.post('/', checkInController.createCheckIn);
router.put('/update', checkInController.updateStudentPercentageInCheckIn);
router.post('/add-student', checkInController.addStudentToCheckIn);
router.post('/remove-student', checkInController.removeStudentFromCheckIn);
router.get('/:checkInId', checkInController.getCheckIn);
router.get('/', checkInController.getAllCheckIns);
router.delete('/:checkInId', checkInController.deleteCheckIn);

module.exports = router;
