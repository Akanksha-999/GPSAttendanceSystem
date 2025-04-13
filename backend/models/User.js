
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  faceDescriptor: {
    type: [Number],
    required: true,},
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  },
});

module.exports = mongoose.model("User", UserSchema);
