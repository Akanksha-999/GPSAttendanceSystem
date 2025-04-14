const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ REGISTER ROUTE
router.post("/register", async (req, res) => {
  const { name, email, password, role,faceDescriptor } = req.body;

  // ✅ Validate required fields
  if (!name || !email || !password || !faceDescriptor) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (!faceDescriptor || faceDescriptor.length === 0) {
    return res.status(400).json({ message: "Face descriptor is required." });
  }

  // ✅ Validate faceDescriptor is an array
  if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return res.status(400).json({ message: "Invalid face descriptor." });
  }


  
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role,
      faceDescriptor: Array.from(faceDescriptor) });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err);//log the actual error
    res.status(500).send("Server error");
  }
});

// ✅ LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
