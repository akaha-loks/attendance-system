const Group = require("../models/Group");

const Student = require("../models/Student");

const Attendance = require("../models/Attendance");

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const existingGroup = await Group.findOne({ name });

    if (existingGroup) {
      return res.status(400).json({
        message: "Group already exists",
      });
    }

    const group = await Group.create({
      name,

      teacher: req.user.id,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      teacher: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,

      teacher: req.user.id,
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const existingGroup = await Group.findOne({ name });

    if (existingGroup && existingGroup._id.toString() !== req.params.id) {
      return res.status(400).json({
        message: "Group already exists",
      });
    }

    group.name = name;

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,

      teacher: req.user.id,
    });

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    await Student.deleteMany({
      group: req.params.id,
    });

    await Attendance.deleteMany({
      group: req.params.id,
    });

    await group.deleteOne();

    res.json({
      message: "Group and related data deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createGroup,

  getGroups,

  updateGroup,

  deleteGroup,
};
