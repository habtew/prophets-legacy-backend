const express = require('express');
const childController = require('../controllers/childController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', childController.registerChild);
router.post('/login', childController.childLogin);

// Protected routes - require authentication
router.post('/logout', authenticateToken, requireChild, childController.childLogout);
router.get('/me', authenticateToken, requireChild, childController.getProfile);
router.put('/me', authenticateToken, requireChild, childController.updateProfile);
router.post('/me/avatar', authenticateToken, requireChild, childController.uploadAvatar);
router.get('/me/notification-prefs', authenticateToken, childController.getNotificationPreferences);
router.put('/me/notification-prefs', authenticateToken, childController.updateNotificationPreferences);
router.get('/me/favorites', authenticateToken, requireChild, childController.getFavorites);
router.post('/me/favorites', authenticateToken, requireChild, childController.addFavorite);
router.delete('/me/favorites/:lessonId', authenticateToken, requireChild, childController.removeFavorite);

module.exports = router;
