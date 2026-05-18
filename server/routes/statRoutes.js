const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getGlobalStats,

  getGroupStats,

  getStudentStats,
} = require("../controllers/statController");

router.get("/global", protect, getGlobalStats);

router.get("/group/:id", protect, getGroupStats);

router.get("/student/:id", protect, getStudentStats);

module.exports = router;
