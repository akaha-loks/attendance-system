const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createStudent,

  getStudents,

  updateStudent,

  deleteStudent,
} = require("../controllers/studentController");

router.post("/", protect, createStudent);

router.get("/", protect, getStudents);

router.put("/:id", protect, updateStudent);

router.delete("/:id", protect, deleteStudent);

module.exports = router;
