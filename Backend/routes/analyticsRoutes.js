const express = require('express');
const { getDoctorAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/doctor', protect, authorize('doctor'), getDoctorAnalytics);

module.exports = router;