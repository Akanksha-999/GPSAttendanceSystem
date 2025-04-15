const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // This must match your User model name
  //   required: true
  // },
  email: String,
  name: String,
  timestamp: Date,
  location: {
    latitude: Number,
    longitude: Number,
  },
  status: String,
});

module.exports = mongoose.model("Attendance", attendanceSchema);
