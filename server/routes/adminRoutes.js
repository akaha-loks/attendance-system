const express = require("express");

const router = express.Router();

const {
  protect,

  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getPendingUsers,

  approveTeacher,

  deactivateTeacher,

  transferGroups,
} = require("../controllers/adminController");

router.get(
  "/pending-users",

  protect,

  adminOnly,

  getPendingUsers,
);

router.put(
  "/approve/:id",

  protect,

  adminOnly,

  approveTeacher,
);

router.put(
  "/deactivate/:id",

  protect,

  adminOnly,

  deactivateTeacher,
);

router.put(
  "/transfer-groups",

  protect,

  adminOnly,

  transferGroups,
);

module.exports = router;
