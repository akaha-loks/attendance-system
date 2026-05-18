const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createGroup,

  getGroups,

  updateGroup,

  deleteGroup,
} = require("../controllers/groupController");

router.post("/", protect, createGroup);

router.get("/", protect, getGroups);

router.put("/:id", protect, updateGroup);

router.delete("/:id", protect, deleteGroup);

module.exports = router;
