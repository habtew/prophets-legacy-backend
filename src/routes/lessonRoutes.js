const express = require('express');
const lessonController = require('../controllers/lessonController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

// GET /api/lessons/main-categories - Get all main categories
router.get('/main-categories', authenticateToken, requireChild, lessonController.getMainCategories);

// GET /api/lessons/main-categories/:id - Get main category contents
router.get('/main-categories/:id', authenticateToken, requireChild, lessonController.getMainCategoryContents);

// GET /api/lessons/main-categories/:mainCategoryId/subcategories/:subcategoryId - Get lessons in subcategory
router.get('/main-categories/:mainCategoryId/subcategories/:subcategoryId', authenticateToken, requireChild, lessonController.getSubcategoryLessons);

// GET /api/lessons/:id - Get single lesson details
router.get('/:id', authenticateToken, requireChild, lessonController.getLessonDetail);

// POST /api/lessons/:id/complete - Mark lesson as complete
router.post('/:id/complete', authenticateToken, requireChild, lessonController.completeLesson);

module.exports = router;
