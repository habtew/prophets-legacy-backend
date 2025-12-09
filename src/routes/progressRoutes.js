const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress/me/summary - Get progress summary
router.get('/me/summary', authenticateToken, leaderboardController.getProgressSummary);

module.exports = router;
