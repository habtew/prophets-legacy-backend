const express = require('express');
const adminAuthRoutes = require('./adminAuthRoutes');
const childRoutes = require('./childRoutes');
const lessonRoutes = require('./lessonRoutes');
const challengeCategoryRoutes = require('./challengeCategoryRoutes');
const attemptSessionRoutes = require('./attemptSessionRoutes');
const reminderRoutes = require('./reminderRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const progressRoutes = require('./progressRoutes');
const shareRoutes = require('./shareRoutes');
const adminRoutes = require('./adminRoutes');
const internalRoutes = require('./internalRoutes');
const systemRoutes = require('./systemRoutes');
const uploadRoutes = require('./uploadRoutes');
const avatarRoutes = require('./avatarRoutes');
const analyticsRoutes = require('./analyticsRoutes');

const router = express.Router();

router.use('/admin/auth', adminAuthRoutes);
router.use('/children', childRoutes);
router.use('/lessons', lessonRoutes);
router.use('/challenge-categories', challengeCategoryRoutes);
router.use('/attempt-sessions', attemptSessionRoutes);
router.use('/reminders', reminderRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/progress', progressRoutes);
router.use('/share', shareRoutes);
router.use('/admin', adminRoutes);
router.use('/internal', internalRoutes);
router.use('/upload', uploadRoutes);
router.use('/avatars', avatarRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/', systemRoutes);

module.exports = router;
