const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Appointment = require("./models/Appointment");

// Load environment variables
dotenv.config();

const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const patientRoutes = require("./routes/patientRoutes");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatIntegrationRoutes = require("./routes/chatIntegrationRoutes");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());

// --- UPDATE HERE ---
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000", 
  "https://algo-med.vercel.app", // Added your Vercel App
  process.env.CLIENT_URL 
];
// -------------------

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Database Connection
connectDB();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/realtime-chat", chatIntegrationRoutes);

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

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // This will now automatically include your Vercel app
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket Authentication Middleware
io.use(async (socket, next) => {
  try {
    let token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket Auth Error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.user.name} (${socket.user.role}) - ID: ${socket.id}`);

  socket.on("join-room", async ({ appointmentId }) => {
    try {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        socket.emit("error", { message: "Appointment not found" });
        return;
      }

      const userId = socket.user._id.toString();
      const isAuthorized = 
        (appointment.patientId.toString() === userId) || 
        (appointment.doctorId.toString() === userId);

      if (!isAuthorized) {
        console.warn(`Unauthorized join attempt by ${socket.user.name} for room ${appointmentId}`);
        socket.emit("error", { message: "You are not authorized to join this consultation." });
        return;
      }

      socket.join(appointmentId);
      console.log(`User ${socket.user.name} joined room: ${appointmentId}`);

      socket.broadcast.to(appointmentId).emit("user-connected", { 
        userId: socket.user._id,
        name: socket.user.name,
        role: socket.user.role
      });

    } catch (error) {
      console.error("Error in join-room:", error);
    }
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.broadcast.to(roomId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.broadcast.to(roomId).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.broadcast.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});