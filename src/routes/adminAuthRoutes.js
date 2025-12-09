const express = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/setup-super-admin', adminAuthController.initializeSuperAdmin);
router.post('/login', adminAuthController.adminLogin);
router.post('/reset-password', adminAuthController.resetAdminPassword);

// Protected routes - require admin authentication
router.post('/register', authenticateToken, requireAdmin, adminAuthController.registerAdmin);
router.post('/logout', authenticateToken, requireAdmin, adminAuthController.adminLogout);
router.get('/admins', authenticateToken, requireAdmin, adminAuthController.getAllAdmins);
router.get('/me', authenticateToken, requireAdmin, adminAuthController.getAdminProfile);

module.exports = router;
