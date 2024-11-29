const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "https://primaverse-assist.netlify.app",
      "https://assist.primaverse.tech",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 7181;

// Middleware for CORS
app.use(
  cors({
    origin: [
      "https://primaverse-assist.netlify.app",
      "https://assist.primaverse.tech",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware for JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Preflight Request Handler
app.options("*", (req, res) => {
  console.log("Preflight request received");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).send();
});

// Test Route to ensure the server is running
app.get("/", (req, res) => {
  console.log("Test request received");
  res.send("Server is running");
});

// Assistance request route
app.post("/api/assist", (req, res) => {
  console.log("Assistance request received");
  const { cabinName } = req.body;

  if (!cabinName) {
    console.log("Invalid request: No cabin name provided");
    return res.status(400).json({ message: "Cabin name is required" });
  }

  // Emit a Socket.IO event to notify the staff dashboard
  io.emit("new-assistance-request", { cabinName });
  console.log(`Assistance request sent for cabin: ${cabinName}`);

  res.json({ message: "Assistance request received", cabinName });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Refresh event every 10 seconds
setInterval(() => {
  io.emit("refresh", { message: "Server is refreshing every 10 seconds" });
  console.log("Server sent refresh event");
}, 10000); // 10 seconds

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
