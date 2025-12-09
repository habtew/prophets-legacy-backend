const express = require('express');
const shareController = require('../controllers/shareController');
const { authenticateToken, requireChild } = require('../middleware/auth');
const { shareLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/render', authenticateToken, requireChild, shareLimiter, shareController.renderShareable);
router.get('/:shareId', authenticateToken, requireChild, shareController.getShareableStatus);
router.post('/:shareId/track', shareController.trackShare);

module.exports = router;
