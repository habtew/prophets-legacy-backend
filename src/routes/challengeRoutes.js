const express = require('express');
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

router.get('/challenge-categories', authenticateToken, requireChild, challengeController.getChallengeCategories);
router.post('/attempt-sessions', authenticateToken, requireChild, challengeController.startSession);
router.get('/attempt-sessions/:sessionId/next-question', authenticateToken, requireChild, challengeController.getNextQuestion);
router.post('/attempt-sessions/:sessionId/answers', authenticateToken, requireChild, challengeController.submitAnswer);
router.post('/attempt-sessions/:sessionId/finish', authenticateToken, requireChild, challengeController.finishSession);

module.exports = router;
