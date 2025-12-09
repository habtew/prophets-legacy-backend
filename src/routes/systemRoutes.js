const express = require('express');
const systemController = require('../controllers/systemController');

const router = express.Router();

router.get('/health', systemController.getHealth);
router.get('/version', systemController.getVersion);

module.exports = router;
