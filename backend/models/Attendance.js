const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
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
