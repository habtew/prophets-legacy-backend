const express = require('express');
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

// POST /api/attempt-sessions - Start a new challenge session
router.post('/', authenticateToken, requireChild, challengeController.startSession);

// GET /api/attempt-sessions/:sessionId/next-question - Get next question
router.get('/:sessionId/next-question', authenticateToken, requireChild, challengeController.getNextQuestion);

// POST /api/attempt-sessions/:sessionId/answers - Submit answer
router.post('/:sessionId/answers', authenticateToken, requireChild, challengeController.submitAnswer);

// POST /api/attempt-sessions/:sessionId/finish - Finish session
router.post('/:sessionId/finish', authenticateToken, requireChild, challengeController.finishSession);

module.exports = router;
