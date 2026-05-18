// statController.js

const Student = require("../models/Student");
const Group = require("../models/Group");
const Attendance = require("../models/Attendance");
const mongoose = require("mongoose");

const formatDate = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateFilter = (period) => {
  const today = new Date();

  if (period === "today") {
    return formatDate(today);
  }

  if (period === "week") {
    const weekAgo = new Date();

    weekAgo.setDate(today.getDate() - 7);

    return {
      $gte: formatDate(weekAgo),
    };
  }

  if (period === "month") {
    const monthAgo = new Date();

    monthAgo.setMonth(today.getMonth() - 1);

    return {
      $gte: formatDate(monthAgo),
    };
  }

  return {};
};

const getGlobalStats = async (req, res) => {
  try {
    const period = req.query.period || "today";

    const dateFilter = getDateFilter(period);

    const attendanceFilter = {};

    if (period) {
      attendanceFilter.date = dateFilter;
    }

    const totalStudents = await Student.countDocuments();

    const totalGroups = await Group.countDocuments();

    const totalAttendance = await Attendance.countDocuments(attendanceFilter);

    const presentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "present",
    });

    const absentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "absent",
    });

    let attendancePercentage = 0;

    if (totalAttendance > 0) {
      attendancePercentage = Math.round((presentCount / totalAttendance) * 100);
    }

    const todayString = formatDate(new Date());

    const groups = await Group.find();

    const groupStats = await Promise.all(
      groups.map(async (item) => {
        const students = await Student.find({
          group: item._id,
        });

        const attendance = await Attendance.find({
          group: item._id,

          date: todayString,
        });

        const presentCount = attendance.filter(
          (a) => a.status === "present",
        ).length;

        const absentCount = attendance.filter(
          (a) => a.status === "absent",
        ).length;

        const unmarkedCount = students.length - attendance.length;

        return {
          groupName: item.name,

          studentsCount: students.length,

          presentCount,

          absentCount,

          unmarkedCount,
        };
      }),
    );

    const topAbsentRaw = await Attendance.aggregate([
      {
        $match: {
          status: "absent",

          date: dateFilter,
        },
      },

      {
        $group: {
          _id: "$student",

          absentCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          absentCount: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    const topAbsentStudents = [];

    for (const item of topAbsentRaw) {
      const student = await Student.findById(item._id);

      if (student) {
        topAbsentStudents.push({
          fullName: student.fullName,

          absentCount: item.absentCount,
        });
      }
    }

    res.json({
      mode: "global",

      totalStudents,

      totalGroups,

      totalAttendance,

      presentCount,

      absentCount,

      attendancePercentage,

      groupStats,

      topAbsentStudents,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGroupStats = async (req, res) => {
  try {
    const period = req.query.period || "today";

    const groupId = req.params.id;

    const dateFilter = getDateFilter(period);

    const attendanceFilter = {
      group: new mongoose.Types.ObjectId(groupId),

      date: dateFilter,
    };

    const group = await Group.findById(groupId);

    const totalStudents = await Student.countDocuments({
      group: groupId,
    });

    const totalAttendance = await Attendance.countDocuments(attendanceFilter);

    const presentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "present",
    });

    const absentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "absent",
    });

    let attendancePercentage = 0;

    if (totalAttendance > 0) {
      attendancePercentage = Math.round((presentCount / totalAttendance) * 100);
    }

    const topAbsentRaw = await Attendance.aggregate([
      {
        $match: {
          group: new mongoose.Types.ObjectId(groupId),

          status: "absent",

          date: dateFilter,
        },
      },

      {
        $group: {
          _id: "$student",

          absentCount: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          absentCount: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    const topAbsentStudents = [];

    for (const item of topAbsentRaw) {
      const student = await Student.findById(item._id);

      if (student) {
        topAbsentStudents.push({
          fullName: student.fullName,

          absentCount: item.absentCount,
        });
      }
    }

    res.json({
      mode: "group",

      groupName: group.name,

      totalStudents,

      totalAttendance,

      presentCount,

      absentCount,

      attendancePercentage,

      topAbsentStudents,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const period = req.query.period || "today";

    const studentId = req.params.id;

    const dateFilter = getDateFilter(period);

    const attendanceFilter = {
      student: new mongoose.Types.ObjectId(studentId),

      date: dateFilter,
    };

    const student = await Student.findById(studentId).populate("group", "name");

    const totalAttendance = await Attendance.countDocuments(attendanceFilter);

    const presentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "present",
    });

    const absentCount = await Attendance.countDocuments({
      ...attendanceFilter,

      status: "absent",
    });

    let attendancePercentage = 0;

    if (totalAttendance > 0) {
      attendancePercentage = Math.round((presentCount / totalAttendance) * 100);
    }

    const attendanceHistory = await Attendance.find(attendanceFilter).sort({
      date: 1,
    });

    res.json({
      mode: "student",

      studentName: student.fullName,

      studentEmail: student.email,

      groupName: student.group?.name,

      totalAttendance,

      presentCount,

      absentCount,

      attendancePercentage,

      attendanceHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getGlobalStats,

  getGroupStats,

  getStudentStats,
};
