
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import session from "express-session";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import passport from "./config/passport.js";
import deliveryRoutes from "./routes/delivery.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from './routes/userRoutes.js';
import adminTokenRoutes from './routes/adminTokenRoutes.js';
import { initSocket } from "./socket.js";
import otpRoutes from './routes/otpRoutes.js';

  


  dotenv.config();
  const app = express();

  // Enhanced error logging
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
  });

  // Route logging middleware
  app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.path}`);
    console.log('Body:', req.body);
    next();
  });

  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  }));


connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminTokenRoutes);
app.use('/api/otp', otpRoutes);

  app.use(passport.initialize());
  app.use(passport.session());

  // Database connection
 




  // Test endpoint
  app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );