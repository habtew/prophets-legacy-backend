const express = require('express');
const reminderController = require('../controllers/reminderController');
const { authenticateToken, requireChild } = require('../middleware/auth');

const router = express.Router();

// GET /api/reminders/me - Get personal reminders (child)
router.get('/me', authenticateToken, requireChild, reminderController.getPersonalReminders);

// POST /api/reminders/me - Create personal reminder (child)
router.post('/me', authenticateToken, requireChild, reminderController.createPersonalReminder);

// PUT /api/reminders/me/:id - Update personal reminder (child)
router.put('/me/:id', authenticateToken, requireChild, reminderController.updatePersonalReminder);

// DELETE /api/reminders/me/:id - Delete personal reminder (child)
router.delete('/me/:id', authenticateToken, requireChild, reminderController.deletePersonalReminder);

module.exports = router;
