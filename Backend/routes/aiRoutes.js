const express = require('express');
const { generateSOAPNotes } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/generate-soap', protect, authorize('doctor'), generateSOAPNotes);

module.exports = router;