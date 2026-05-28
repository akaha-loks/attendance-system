const Student = require("../models/Student");

const Group = require("../models/Group");

const createStudent = async (req, res) => {
  try {
    const { fullName, email, group } = req.body;

    const existingGroup = await Group.findOne({
      _id: group,

      teacher: req.user.id,
    });

    if (!existingGroup) {
      return res.status(403).json({
        message: "Нет доступа к группе",
      });
    }

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    const student = await Student.create({
      fullName,

      email,

      group,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getStudents = async (req, res) => {
  try {
    const groupFilter = {
      teacher: req.user.id,
    };

    if (req.query.group) {
      groupFilter._id = req.query.group;
    }

    const groups = await Group.find(groupFilter);

    const groupIds = groups.map((group) => group._id);

    const students = await Student.find({
      group: {
        $in: groupIds,
      },
    })

      .populate("group", "name")

      .sort({
        createdAt: -1,
      });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { fullName, email, group } = req.body;

    const student = await Student.findById(req.params.id).populate("group");

    if (!student || student.group.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Нет доступа к студенту",
      });
    }

    const existingStudent = await Student.findOne({ email });

    if (existingStudent && existingStudent._id.toString() !== req.params.id) {
      return res.status(400).json({
        message: "Student already exists",
      });
    }

    const targetGroup = await Group.findOne({
      _id: group,

      teacher: req.user.id,
    });

    if (!targetGroup) {
      return res.status(403).json({
        message: "Нет доступа к группе",
      });
    }

    student.fullName = fullName;

    student.email = email;

    student.group = group;

    await student.save();

    res.json(student);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("group");

    if (!student || student.group.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Нет доступа к студенту",
      });
    }

    await student.deleteOne();

    res.json({
      message: "Student deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createStudent,

  getStudents,

  updateStudent,

  deleteStudent,
};
