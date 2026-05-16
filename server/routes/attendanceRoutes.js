const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');

const {
  saveAttendance,
  getAttendance
} = require('../controllers/attendanceController');

router.post('/', protect, saveAttendance);

router.get('/', protect, getAttendance);

module.exports = router;