const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  getStats
} = require('../controllers/statController');

router.get('/', protect, getStats);

module.exports = router;