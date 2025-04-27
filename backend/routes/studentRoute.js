const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/create', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:studentId', studentController.getStudent);
router.put('/:studentId', studentController.updateStudent);
router.delete('/:studentId', studentController.deleteStudent);
router.post('/book-session', studentController.bookSession);
router.post('/check-in', studentController.checkIn);
router.patch('/incrementSolde', studentController.incrementSolde);

module.exports = router;
