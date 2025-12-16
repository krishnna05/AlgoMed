const express = require('express');
const { registerPatient, registerDoctor, login, logout } = require('../controllers/authController');

const router = express.Router();

// Separate routes for patient and doctor registration
router.post('/register-patient', registerPatient);
router.post('/register-doctor', registerDoctor);

router.post('/login', login);
router.post('/logout', logout);

module.exports = router;