const express = require('express');
const { 
    processAIChat, 
    getUserThreads, 
    getThreadMessages, 
    deleteThread 
} = require('../controllers/chatController'); // Imports logic from the controller
const { protect } = require('../middleware/authMiddleware'); // Ensures user is logged in

const router = express.Router();

router.post('/', protect, processAIChat);
router.get('/thread', protect, getUserThreads);
router.get('/thread/:threadId', protect, getThreadMessages);
router.delete('/thread/:threadId', protect, deleteThread);

module.exports = router;