const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, name, faceDescriptor } = req.body;
  const user = await User.create({ email, name, faceDescriptor });
  res.json({ success: true, user });
});

router.get("/all", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


router.get("/", async (req, res) => {
  try {const { role } = req.query;
  // const users = await User.find(role ? { role } : {});
  const filter = role ? { role } : {}; 
  const users = await User.find(filter)
    .select("-password") // Exclude sensitive data
    .lean();
  res.json(users);
}catch (error) {
  console.error("User fetch error:", err);
  res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
