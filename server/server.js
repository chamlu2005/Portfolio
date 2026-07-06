import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// DB & Config Loaders
dbManagerInit(); // Pre-bind to prevent loading races
import dbManager from './config/db.js';
import databaseService from './services/databaseService.js';
import { seedDatabase } from './database/seeder.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

// Path resolutions
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function dbManagerInit() {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5001;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // allow images to be loaded cross-origin (needed for frontend avatars)
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite default dev server
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Logger Middleware
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file directories (expose uploads)
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Rate Limiting (Prevent Brute Force)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 message submissions per hour
  message: { success: false, message: 'Too many contact messages submitted. Please wait an hour.' }
});

app.use('/api', globalLimiter);
app.use('/api/messages', contactLimiter);

// API Routers
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contact', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/system', systemRoutes);

// Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbManager.getType(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error Handler Triggered:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Database start-up & listen
const startServer = async () => {
  try {
    // 1. Initialize DB Connection
    await dbManager.initialize();
    
    // 2. Run schema setup
    await databaseService.runMigrations();
    
    // 3. Seed initial data
    await seedDatabase();

    // 4. Spin up Express listener
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
      console.log(`🌐 API endpoints accessible at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Failed to start application server.', err);
    process.exit(1);
  }
};

startServer();
