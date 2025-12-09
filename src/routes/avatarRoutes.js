const express = require('express');
const adminMediaController = require('../controllers/adminMediaController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/predefined', authenticateToken, adminMediaController.getAllPredefinedAvatars);

module.exports = router;
