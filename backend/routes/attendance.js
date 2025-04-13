const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

const HOSTEL_LAT = 23.256394;
const HOSTEL_LNG = 77.458534;
const RADIUS_KM = 0.5;

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/mark", async (req, res) => {
  const { faceDescriptor, latitude, longitude } = req.body;

  const users = await User.find();
  const distances = users.map(user => {
    const dist = faceDescriptor.reduce((sum, val, i) => sum + ((val - user.faceDescriptor[i]) ** 2), 0);
    return { user, distance: Math.sqrt(dist) };
  });

  const match = distances.sort((a, b) => a.distance - b.distance)[0];
  if (match.distance > 0.6) return res.status(404).json({ msg: "Face not recognized." });

  // Add role validation
const user = match.user;
if (user.role !== "student") {
  return res.status(403).json({ 
    msg: "Only students can mark attendance." 
  });
}
  const distFromHostel = haversine(latitude, longitude, HOSTEL_LAT, HOSTEL_LNG);

  if (distFromHostel > RADIUS_KM)
    return res.status(403).json({  msg: `You are ${distFromHostel.toFixed(2)} km away from the hostel. Attendance denied.` });

  // ✅ Check if already marked today
const start = new Date();
start.setHours(0, 0, 0, 0);
const end = new Date();
end.setHours(23, 59, 59, 999);

const existing = await Attendance.findOne({
  userId: user._id,
  timestamp: { $gte: start, $lte: end }
});

if (existing) {
  return res.status(409).json({ msg: "Attendance already marked today." });
}


  const attendance = await Attendance.create({
    userId: user._id,
    email: user.email,
    name: user.name,
    timestamp: new Date(),
    location: { latitude, longitude },
    status: "Present"
  });

  res.json({ success: true, attendance });
  console.log("Attendance record created:", attendance); // After saving

});

router.get("/daily-report", async (req, res) => {
  const { date } = req.query; // format: "YYYY-MM-DD"
  const targetDate = new Date(date);
  const start = new Date(targetDate.setHours(0, 0, 0, 0));
  const end = new Date(targetDate.setHours(23, 59, 59, 999));

  const attendanceRecords = await Attendance.find({
    timestamp: { $gte: start, $lte: end }
  }).populate({
    path: "userId",
    match: { role: "student" // Only include students
  }});
  
  // Filter out nulls (admins)
  const presentStudents = attendanceRecords.filter(a => a.userId !== null);

  const allUsers = await User.find();
  const presentUsers = attendanceRecords.map(a => a.email);
  const absentUsers = allUsers.filter(u => !presentUsers.includes(u.email));

  res.json({
    date,
    total: allUsers.length,
    present: attendanceRecords.length,
    absent: absentUsers.length,
    presentUsers: attendanceRecords,
    absentUsers
  });
});

// backend/routes/attendance.js
// router.post("/reset", async (req, res) => {
//   try{
//     const { studentId } = req.body;
  
//   // Verify admin role
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ msg: "Only admins can reset attendance" });
//   }
// // Validate student ID
// if (!mongoose.Types.ObjectId.isValid(req.body.studentId)) {
//   return res.status(400).json({ msg: "Invalid student ID" });
// }

// // Delete attendance records
// const today = new Date();
// const start = new Date(today.setHours(0,0,0,0));
// const end = new Date(today.setHours(23,59,59,999));

//   await Attendance.deleteMany({
//     userId: studentId,
//     timestamp: { $gte: start, $lte: end }
//   });

//   res.json({ success: true });
// }catch (err){
//   res.status(500).json({ msg: "Server error" });
// }
// });

router.post("/reset", async (req, res) => {
  try {
    // 1. Verify auth header
    const token = req.header("x-auth-token");
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ msg: "No token provided" });
    }

    // 2. Verify admin role
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      console.log("JWT verification failed:", jwtErr);
      return res.status(401).json({ msg: "Invalid token" });
    }

    if (decoded.role !== "admin") {
      console.log("Non-admin attempt:", decoded.email);
      return res.status(403).json({ msg: "Admin access required" });
    }

    // 3. Validate studentId
    if (!mongoose.Types.ObjectId.isValid(req.body.studentId)) {
      console.log("Invalid student ID:", req.body.studentId);
      return res.status(400).json({ msg: "Invalid student ID" });
    }

    // 4. Delete attendance
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const end = new Date(today.setHours(23,59,59,999));

    const result = await Attendance.deleteMany({
      userId: req.body.studentId,
      timestamp: { $gte: start, $lte: end }
    });

    console.log(`Reset successful for ${req.body.studentId}. Deleted: ${result.deletedCount}`);
    res.json({
      success: true,
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("Reset endpoint error:", err);
    res.status(500).json({ 
      msg: "Server error during reset",
      error: err.message 
    });
  }
});

  
module.exports = router;
