const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard - Get leaderboard rankings
router.get('/', authenticateToken, leaderboardController.getLeaderboard);

module.exports = router;
