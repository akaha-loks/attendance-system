const Student = require('../models/Student');


// CREATE STUDENT

const createStudent = async (req, res) => {

  try {

    const {
      fullName,
      email,
      group
    } = req.body;

    const existingStudent =
      await Student.findOne({ email });

    if (existingStudent) {

      return res.status(400).json({
        message: 'Student already exists'
      });

    }

    const student = await Student.create({

      fullName,

      email,

      group

    });

    res.status(201).json(student);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// GET STUDENTS

const getStudents = async (req, res) => {

  try {

    const filter = {};

    if (req.query.group) {
      filter.group = req.query.group;
    }

    const students = await Student.find(filter)

      .populate('group', 'name')

      .sort({ createdAt: -1 });

    res.json(students);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// UPDATE STUDENT

const updateStudent = async (req, res) => {

  try {

    const {
      fullName,
      email,
      group
    } = req.body;

    const student =
      await Student.findById(req.params.id);

    if (!student) {

      return res.status(404).json({
        message: 'Student not found'
      });

    }


    // CHECK DUPLICATE EMAIL

    const existingStudent =
      await Student.findOne({ email });

    if (

      existingStudent &&

      existingStudent._id.toString() !==
      req.params.id

    ) {

      return res.status(400).json({
        message: 'Student already exists'
      });

    }


    // UPDATE

    student.fullName = fullName;

    student.email = email;

    student.group = group;

    await student.save();

    res.json(student);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


// DELETE STUDENT

const deleteStudent = async (req, res) => {

  try {

    const student =
      await Student.findById(req.params.id);

    if (!student) {

      return res.status(404).json({
        message: 'Student not found'
      });

    }

    await student.deleteOne();

    res.json({
      message: 'Student deleted'
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


module.exports = {

  createStudent,

  getStudents,

  updateStudent,

  deleteStudent

};