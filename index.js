const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config");
const feedbackRoutes = require("./Routes");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("AI-Powered Customer Feedback Hub API Running");
});

// Feedback Routes
app.use("/api/feedback", feedbackRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});