const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/create', sessionController.createSession);
router.get('/:sessionId', sessionController.getSession);
router.get('/', sessionController.getAllSessions);
router.put('/:sessionId', sessionController.updateSession);
router.delete('/:sessionId', sessionController.deleteSession);

module.exports = router;
