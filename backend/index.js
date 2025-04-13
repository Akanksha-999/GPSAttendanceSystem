const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config");

const app = express();
app.use(cors(
    {
        // origin: "http://localhost:5173", // Your Vite frontend URL
        // methods: ["GET", "POST"]
        origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["x-auth-token", "Content-Type"]
      }
));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
connectDB();

// ✅ Your routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const attendanceRoutes = require("./routes/attendance");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
