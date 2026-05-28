const User = require("../models/User");

const Group = require("../models/Group");

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "pending",
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const approveTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.role = "teacher";

    await user.save();

    res.json({
      message: "Преподаватель подтвержден",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deactivateTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    user.role = "inactive";

    await user.save();

    res.json({
      message: "Преподаватель деактивирован",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const transferGroups = async (req, res) => {
  try {
    const { oldTeacherId, newTeacherId } = req.body;

    const newTeacher = await User.findOne({
      _id: newTeacherId,

      role: "teacher",
    });

    if (!newTeacher) {
      return res.status(404).json({
        message: "Новый преподаватель не найден",
      });
    }

    await Group.updateMany(
      {
        teacher: oldTeacherId,
      },

      {
        teacher: newTeacherId,
      },
    );

    res.json({
      message: "Группы успешно переданы",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getPendingUsers,

  approveTeacher,

  deactivateTeacher,

  transferGroups,
};
