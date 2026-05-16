const Student = require('../models/Student');
const Group = require('../models/Group');
const Attendance = require('../models/Attendance');


// DASHBOARD STATS

const getStats = async (req, res) => {

  try {

    const totalStudents =
      await Student.countDocuments();

    const totalGroups =
      await Group.countDocuments();

    const totalAttendance =
      await Attendance.countDocuments();

    const presentCount =
      await Attendance.countDocuments({
        status: 'present'
      });

    const absentCount =
      await Attendance.countDocuments({
        status: 'absent'
      });

    let attendancePercentage = 0;

    if (totalAttendance > 0) {

      attendancePercentage =
        Math.round(
          (presentCount / totalAttendance) * 100
        );

    }

    res.json({
      totalStudents,
      totalGroups,
      totalAttendance,
      presentCount,
      absentCount,
      attendancePercentage
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getStats
};