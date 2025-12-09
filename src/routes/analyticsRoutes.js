const express = require('express');
const router = express.Router();
const {
  getUserStatistics,
  getActivityStatistics,
  getTechnicalStatistics,
  getGeneralStatistics,
  trackLogin,
  trackActivity,
  trackTechnicalEvent
} = require('../controllers/analyticsController');
const { authenticateToken, requireAdmin, requireChild } = require('../middleware/auth');

router.get('/users', authenticateToken, requireAdmin, getUserStatistics);
router.get('/activity', authenticateToken, requireAdmin, getActivityStatistics);
router.get('/technical', authenticateToken, requireAdmin, getTechnicalStatistics);
router.get('/general', authenticateToken, requireAdmin, getGeneralStatistics);

router.post('/track/login', authenticateToken, requireChild, trackLogin);
router.post('/track/activity', authenticateToken, requireChild, trackActivity);
router.post('/track/technical', trackTechnicalEvent);

module.exports = router;
