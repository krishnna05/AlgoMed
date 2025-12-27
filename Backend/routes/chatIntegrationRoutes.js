const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getFirebaseToken, uploadFile } = require('../controllers/chatIntegrationController');

router.get('/token', protect, getFirebaseToken);
router.post('/upload', protect, upload.single('file'), uploadFile);

module.exports = router;