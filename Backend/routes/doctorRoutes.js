const express = require('express');
const { 
    getAllDoctors, 
    getDoctorById, 
    updateDoctorProfile, 
    getDoctorProfile 
} = require('../controllers/doctorController'); 
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', getAllDoctors);

router.get('/profile/me', protect, authorize('doctor'), getDoctorProfile);

router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);

router.get('/:id', getDoctorById);

module.exports = router;