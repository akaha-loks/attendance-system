const express = require('express');

const router = express.Router();

const protect =
  require('../middleware/authMiddleware');

const {

  createStudent,

  getStudents,

  updateStudent,

  deleteStudent

} = require('../controllers/studentController');


// CREATE STUDENT

router.post(
  '/',
  protect,
  createStudent
);


// GET STUDENTS

router.get(
  '/',
  protect,
  getStudents
);


// UPDATE STUDENT

router.put(
  '/:id',
  protect,
  updateStudent
);


// DELETE STUDENT

router.delete(
  '/:id',
  protect,
  deleteStudent
);


module.exports = router;