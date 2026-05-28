const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  saveAttendance,

  getAttendance,

  getStudentReport,
} = require("../controllers/attendanceController");

router.post("/", protect, saveAttendance);

router.get("/", protect, getAttendance);

router.get("/student-report", protect, getStudentReport);

module.exports = router;
