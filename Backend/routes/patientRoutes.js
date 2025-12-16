const express = require('express');
const { 
    getPatientProfile, 
    updatePatientProfile,
    getPatientSummary,
    getPatientVitalsHistory // Import
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/profile/me', protect, getPatientProfile);
router.put('/profile', protect, updatePatientProfile);
router.get('/:id/summary', protect, authorize('doctor', 'admin'), getPatientSummary);
router.get('/:id/vitals', protect, authorize('doctor', 'admin'), getPatientVitalsHistory);

module.exports = router;