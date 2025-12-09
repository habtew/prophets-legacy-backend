const express = require('express');
const challengeController = require('../controllers/challengeController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

// GET /api/challenge-categories - Get all challenge categories
router.get('/', authenticateToken, requireChild, challengeController.getChallengeCategories);

module.exports = router;
