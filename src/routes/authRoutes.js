const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/parent/register', authLimiter, authController.registerParent);
router.get('/parent/confirm', authController.confirmEmail);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/password-reset/request', authLimiter, authController.requestPasswordReset);
router.post('/password-reset/confirm', authController.confirmPasswordReset);

module.exports = router;
