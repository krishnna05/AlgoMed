const express = require('express');
const { resetDatabase } = require('../controllers/resetController');

const router = express.Router();

// Route to trigger the reset
router.post('/', resetDatabase);

module.exports = router;