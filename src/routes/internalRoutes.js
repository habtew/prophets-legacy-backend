const express = require('express');
const internalWorkerController = require('../controllers/internalWorkerController');
const { authenticateToken, requireInternal } = require('../middleware/auth');

const router = express.Router();

router.post('/workers/campaign-dispatch', authenticateToken, requireInternal, internalWorkerController.dispatchCampaign);
router.post('/workers/notify-child', authenticateToken, requireInternal, internalWorkerController.notifyChild);
router.post('/workers/share-render', authenticateToken, requireInternal, internalWorkerController.renderShareAsset);
router.post('/workers/update-leaderboards', authenticateToken, requireInternal, internalWorkerController.updateLeaderboards);
router.post('/workers/check-achievements', authenticateToken, requireInternal, internalWorkerController.checkAchievements);
router.post('/workers/update-streaks', authenticateToken, requireInternal, internalWorkerController.updateStreaks);

module.exports = router;
