const express = require('express');

const router = express.Router();

const protect =
  require('../middleware/authMiddleware');

const {

  createGroup,

  getGroups,

  updateGroup,

  deleteGroup

} = require('../controllers/groupController');


// CREATE GROUP

router.post(
  '/',
  protect,
  createGroup
);


// GET GROUPS

router.get(
  '/',
  protect,
  getGroups
);


// UPDATE GROUP

router.put(
  '/:id',
  protect,
  updateGroup
);


// DELETE GROUP

router.delete(
  '/:id',
  protect,
  deleteGroup
);


module.exports = router;