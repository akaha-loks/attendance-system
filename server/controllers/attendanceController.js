const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

const Group = require("../models/Group");

const saveAttendance = async (req, res) => {
  try {
    const { student, group, date, status } = req.body;

    const existingGroup = await Group.findOne({
      _id: group,

      teacher: req.user.id,
    });

    if (!existingGroup) {
      return res.status(403).json({
        message: "Нет доступа к группе",
      });
    }

    const existingAttendance = await Attendance.findOne({
      student,
      group,
      date,
    });

    if (existingAttendance) {
      existingAttendance.status = status;

      await existingAttendance.save();

      return res.json(existingAttendance);
    }

    const attendance = await Attendance.create({
      student: new mongoose.Types.ObjectId(student),

      group: new mongoose.Types.ObjectId(group),

      date,

      status,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAttendance = async (req, res) => {
  try {
    const groupFilter = {
      teacher: req.user.id,
    };

    if (req.query.group) {
      groupFilter._id = req.query.group;
    }

    const groups = await Group.find(groupFilter);

    const groupIds = groups.map((group) => group._id);

    const filter = {
      group: {
        $in: groupIds,
      },
    };

    if (req.query.date) {
      filter.date = req.query.date;
    }

    const attendance = await Attendance.find(filter)

      .populate("student", "fullName email")

      .populate("group", "name")

      .sort({
        createdAt: -1,
      });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getStudentReport = async (req, res) => {
  try {
    const { student, from, to } = req.query;

    const groups = await Group.find({
      teacher: req.user.id,
    });

    const groupIds = groups.map((group) => group._id);

    const filter = {
      group: {
        $in: groupIds,
      },
    };

    if (student) {
      filter.student = student;
    }

    if (from && to) {
      filter.date = {
        $gte: from,

        $lte: to,
      };
    }

    const attendance = await Attendance.find(filter)

      .populate("student", "fullName email")

      .populate("group", "name")

      .sort({
        date: 1,
      });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  saveAttendance,
  getAttendance,
  getStudentReport,
};
