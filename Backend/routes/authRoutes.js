const express = require('express');
const Test = require('../models/test');

const router = express.Router();

// Simple ping route to check the route itself
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'Auth route is alive!' });
});

// Test DB route: creates a document in MongoDB
router.get('/test-db', async (req, res, next) => {
  try {
    const doc = await Test.create({
      message: 'Hello from MongoDB Atlas & AlgoMed backend!',
    });

    res.json({
      success: true,
      data: doc,
    });
  } catch (err) {
    next(err); // let your error middleware handle it
  }
});

module.exports = router;
