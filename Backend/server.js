const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Allow Frontend
    credentials: true, // Allow cookies/headers
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Database Connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes); // Login, Signup
app.use("/api/doctors", doctorRoutes); // Doctor search & profiles
app.use("/api/appointments", appointmentRoutes); // Booking logic
app.use("/api/chat", chatRoutes); // AI & Chat logic

// Base Route
app.get("/", (req, res) => {
  res.send("AlgoMed API is running...");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  console.error(`Error: ${errorMessage}`);

  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
