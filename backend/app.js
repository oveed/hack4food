const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

// Middlewares
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoute');
const studentRoutes = require('./routes/studentRoute');
const businessRoutes = require('./routes/businessRoute');
const sessionRoutes = require('./routes/sessionRoute');
const checkInRoutes = require('./routes/checkInRoute');
const bookingRoutes = require('./routes/bookingRoute');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/bookings', bookingRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
