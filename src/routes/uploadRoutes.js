const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/image', authenticateToken, uploadController.upload.single('image'), uploadController.uploadImage);

router.post('/public/image', uploadController.upload.single('image'), uploadController.uploadImage);

module.exports = router;
