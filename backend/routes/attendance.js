const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const adminAuth = require("./middleware/adminAuth");


const HOSTEL_LAT = 23.256394;
const HOSTEL_LNG = 77.458534;
const RADIUS_KM = 0.5;
const FACE_MATCH_THRESHOLD = 0.4; // Adjust based on your face-api.js model

// Improved Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * 
    Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Secure Attendance Marking
router.post("/mark", async (req, res) => {
  try {
    const { faceDescriptor, latitude, longitude } = req.body;
    
    // Authentication Check
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "Authentication required" });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Face Validation
    if (!user.faceDescriptor?.length) {
      return res.status(400).json({ msg: "No face registered for this account" });
    }

    // Face Comparison
    const distance = faceDescriptor.reduce(
      (sum, val, i) => sum + Math.pow(val - user.faceDescriptor[i], 2),
      0
    );
    const similarity = Math.sqrt(distance);
    
    if (similarity > FACE_MATCH_THRESHOLD) {
      return res.status(403).json({ 
        msg: "Face verification failed. Please try again." 
      });
    }
    
   const currentTime=new Date();
   const currentHour=currentTime.getHours();
   const currentMinutes=currentTime.getMinutes();
  // Check If current time is between 7 pm AND 8 PM
  if(currentHour!==19 &&currentHour===20 && currentMinutes===0){
    return res.status(403).json({
      message:"Attendance can only be marked between 7 PM and 8 PM"})
  }

  
    // Location Validation
    const distFromHostel = haversine(latitude, longitude, HOSTEL_LAT, HOSTEL_LNG);
    if (distFromHostel > RADIUS_KM) {
      return res.status(403).json({
        msg: `Attendance denied. You're ${distFromHostel.toFixed(2)}km from hostel.`
      });
    }

    // Prevent Duplicate Entry
    const todayStart = new Date().setHours(0,0,0,0);
    const todayEnd = new Date().setHours(23,59,59,999);
    
    const existing = await Attendance.findOne({
      userId: user._id,
      timestamp: { $gte: todayStart, $lte: todayEnd }
    });
    
    if (existing) {
      return res.status(409).json({ msg: "Attendance already marked today" });
    }

    // Create Attendance Record
    const attendance = await Attendance.create({
      userId: user._id,
      email: user.email,
      name: user.name,
      timestamp: new Date(),
      location: { latitude, longitude },
      status: "Present"
    });

    res.json({ success: true, attendance });

  } catch (err) {
    console.error("Attendance Error:", err);
    res.status(500).json({ msg: "Server error processing attendance" });
  }
});

// Enhanced Daily Report
router.get("/daily-report", adminAuth ,async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ msg: "Date parameter required" });

    const targetDate = new Date(date);
    const start = new Date(targetDate.setHours(0,0,0,0));
    const end = new Date(targetDate.setHours(23,59,59,999));

    // Get attendance with populated user data
    const records = await Attendance.find({
      timestamp: { $gte: start, $lte: end },
      status:"Present"
    });

    // Get all students
    const allStudents = await User.find({ role: "student" }).lean();

    // Process present students
    const presentStudents = records
      .map(record => ({
        name: record.name,
        email: record.email,
        timestamp: record.timestamp
      }));

    // Calculate absentees
    const presentEmails = new Set(presentStudents.map(s => s.email));
    const absentStudents = allStudents
      .filter(student => !presentEmails.has(student.email))
      .map(student => ({ name:student.name, email:student.email }));

    res.json({
      success:true,
      date,
      total: allStudents.length,
      present: presentStudents.length,
      absent: absentStudents.length,
      presentStudents,
      absentStudents
    });

  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ msg: "Error generating daily report" });
  }
});

// Secure Attendance Reset
router.post("/reset", async (req, res) => {
  try {
    // Authentication
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "Authentication required" });

    // Authorization
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "Admin privileges required" });
    }

    // Validation
    const studentId = req.body.studentId;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ msg: "Invalid student ID" });
    }

    // Date range for today
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const end = new Date(today.setHours(23,59,59,999));

    // Delete attendance
    const result = await Attendance.deleteMany({
      userId: studentId,
      timestamp: { $gte: start, $lte: end }
    });

    // Send notification email
    try {
      const student = await User.findById(studentId);
      if (student) {
        const transporter = nodemailer.createTransport({
          // service: "gmail",
          host:"smtp.gmail.com",
          port:587,
          secure:false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `Hostel Admin <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: "Attendance Reset Notification",
          html: `
            <p>Dear ${student.name},</p>
            <p>Your attendance for ${today.toLocaleDateString()} has been reset by the admin.</p>
            <p>Contact hostel office for clarification.</p>
          `
        });
      }
    } catch (emailError) {
      console.error("Email Error:", emailError);
    }

    res.json({
      success: true,
      deletedCount: result.deletedCount
    });

  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ msg: "Server error processing reset" });
  }
});

// Add this route to your existing attendance routes
router.get('/live-locations', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Restrict access to 7 PM - 11 PM
    if (currentHour < 19 || currentHour >= 23) {
      return res.status(403).json({ 
        success: false,
        msg: "Live tracking only available between 7 PM to 11 PM" 
      });
    }

    const students = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "attendances",
          let: { userId: "$_id" },
          pipeline: [
            { 
              $match: { 
                $expr: { 
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $gte: ["$timestamp", new Date().setHours(19,0,0,0)] }
                  ]
                }
              }
            },
            { $sort: { timestamp: -1 } },
            { $limit: 1 }
          ],
          as: "lastLocation"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          latitude: { $arrayElemAt: ["$lastLocation.location.latitude", 0] },
          longitude: { $arrayElemAt: ["$lastLocation.location.longitude", 0] },
          timestamp: { $arrayElemAt: ["$lastLocation.timestamp", 0] },
          distance: {
            $round: [
              haversine(
                { $arrayElemAt: ["$lastLocation.location.latitude", 0] },
                { $arrayElemAt: ["$lastLocation.location.longitude", 0] },
                HOSTEL_LAT,
                HOSTEL_LNG
              ),
              2
            ]
          },
          status: {
            $cond: {
              if: { $gt: ["$distance", RADIUS_KM] },
              then: "Out of Range",
              else: "Within Range"
            }
          }
        }
      }
    ]);

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("Live locations error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;