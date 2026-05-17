const express = require('express');

const router = express.Router();

const protect =
  require('../middleware/authMiddleware');

const {

  saveAttendance,

  getAttendance,

  getStudentReport

} = require('../controllers/attendanceController');


// SAVE

router.post(
  '/',
  protect,
  saveAttendance
);


// GET DAILY

router.get(
  '/',
  protect,
  getAttendance
);


// STUDENT REPORT

router.get(
  '/student-report',
  protect,
  getStudentReport
);


module.exports = router;