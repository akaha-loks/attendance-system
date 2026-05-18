const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index(
  {
    student: 1,
    group: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
