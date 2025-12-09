const express = require('express');
const adminController = require('../controllers/adminController');
const adminMediaController = require('../controllers/adminMediaController');
const uploadController = require('../controllers/uploadController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/children', authenticateToken, requireAdmin, adminController.getAllChildren);

// Lesson hierarchy endpoints (matching public structure)
router.get('/lessons/main-categories', authenticateToken, requireAdmin, adminController.getMainCategories);
router.get('/lessons/main-categories/:id', authenticateToken, requireAdmin, adminController.getMainCategoryContents);
router.get('/lessons/main-categories/:mainCategoryId/subcategories/:subcategoryId', authenticateToken, requireAdmin, adminController.getSubcategoryLessons);

// Lesson category CRUD - separate endpoints for main and sub
router.post('/lesson-categories/main', authenticateToken, requireAdmin, adminController.createMainCategory);
router.post('/lesson-categories/subcategories', authenticateToken, requireAdmin, adminController.createSubcategory);
router.put('/lesson-categories/:id', authenticateToken, requireAdmin, adminController.updateLessonCategory);
router.delete('/lesson-categories/:id', authenticateToken, requireAdmin, adminController.deleteLessonCategory);

// Lesson CRUD
router.get('/lessons', authenticateToken, requireAdmin, adminController.getAllLessons);
router.post('/lessons', authenticateToken, requireAdmin, adminController.createLesson);
router.put('/lessons/:id', authenticateToken, requireAdmin, adminController.updateLesson);
router.delete('/lessons/:id', authenticateToken, requireAdmin, adminController.deleteLesson);

router.get('/challenge-categories', authenticateToken, requireAdmin, adminController.getAllChallengeCategories);
router.post('/challenge-categories', authenticateToken, requireAdmin, adminController.createChallengeCategory);
router.put('/challenge-categories/:id', authenticateToken, requireAdmin, adminController.updateChallengeCategory);
router.delete('/challenge-categories/:id', authenticateToken, requireAdmin, adminController.deleteChallengeCategory);

router.get('/challenge-question-types', authenticateToken, requireAdmin, adminController.getQuestionTypes);
router.get('/challenge-categories/:id/questions', authenticateToken, requireAdmin, adminController.getChallengeQuestions);
router.post('/challenge-categories/:id/questions', authenticateToken, requireAdmin, adminController.addChallengeQuestion);
router.put('/challenge-categories/:id/questions/:qid', authenticateToken, requireAdmin, adminController.updateChallengeQuestion);
router.delete('/challenge-categories/:id/questions/:qid', authenticateToken, requireAdmin, adminController.deleteChallengeQuestion);
router.patch('/challenge-categories/:id/questions/reorder', authenticateToken, requireAdmin, adminController.reorderQuestions);

router.post('/media/upload-url', authenticateToken, adminMediaController.getUploadUrl);

router.get('/sfx', authenticateToken, requireAdmin, adminMediaController.getAllSFX);
router.post('/sfx', authenticateToken, requireAdmin, adminMediaController.addSFX);
router.put('/sfx/:id', authenticateToken, requireAdmin, adminMediaController.updateSFX);
router.delete('/sfx/:id', authenticateToken, requireAdmin, adminMediaController.deleteSFX);

router.get('/animations', authenticateToken, requireAdmin, adminMediaController.getAllAnimations);
router.post('/animations', authenticateToken, requireAdmin, adminMediaController.addAnimation);
router.put('/animations/:id', authenticateToken, requireAdmin, adminMediaController.updateAnimation);
router.delete('/animations/:id', authenticateToken, requireAdmin, adminMediaController.deleteAnimation);

router.get('/backgrounds', authenticateToken, requireAdmin, adminMediaController.getAllBackgrounds);
router.post('/backgrounds', authenticateToken, requireAdmin, adminMediaController.addBackground);
router.put('/backgrounds/:id', authenticateToken, requireAdmin, adminMediaController.updateBackground);
router.delete('/backgrounds/:id', authenticateToken, requireAdmin, adminMediaController.deleteBackground);

router.get('/notification-templates', authenticateToken, requireAdmin, adminMediaController.getAllNotificationTemplates);
router.post('/notification-templates', authenticateToken, requireAdmin, adminMediaController.createNotificationTemplate);
router.put('/notification-templates/:id', authenticateToken, requireAdmin, adminMediaController.updateNotificationTemplate);
router.delete('/notification-templates/:id', authenticateToken, requireAdmin, adminMediaController.deleteNotificationTemplate);

router.post('/notifications/campaigns', authenticateToken, requireAdmin, adminMediaController.createCampaign);
router.post('/notifications/campaigns/:id/test', authenticateToken, requireAdmin, adminMediaController.sendTestNotification);

router.get('/reminders', authenticateToken, requireAdmin, adminMediaController.getAllGlobalReminders);
router.post('/reminders', authenticateToken, requireAdmin, adminMediaController.createGlobalReminder);
router.put('/reminders/:id', authenticateToken, requireAdmin, adminMediaController.updateGlobalReminder);
router.delete('/reminders/:id', authenticateToken, requireAdmin, adminMediaController.deleteGlobalReminder);

router.post('/avatars/predefined', authenticateToken, requireAdmin, uploadController.upload.single('image'), adminMediaController.uploadPredefinedAvatar);
router.put('/avatars/predefined/:id', authenticateToken, requireAdmin, adminMediaController.updatePredefinedAvatar);
router.delete('/avatars/predefined/:id', authenticateToken, requireAdmin, adminMediaController.deletePredefinedAvatar);

module.exports = router;
