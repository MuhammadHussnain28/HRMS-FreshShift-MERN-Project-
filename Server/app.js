import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import employeeRoutes from './routes/employee.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import announcementRoutes from './routes/announcement.js';
import payrollRoutes from './routes/payroll.js';
import errorHandler from './middlewares/errorHandler.js';
import { sendError } from './utils/response.js';
import logger from './utils/logger.js';
import { connectDB } from './config/db.js';

const app = express();

// Auto-connect DB middleware for serverless execution
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(mongoSanitize());

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging via morgan & winston
const morganStream = {
  write: (message) => logger.info(message.trim()),
};
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: morganStream }));
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/payroll', payrollRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  return sendError(res, `Cannot ${req.method} ${req.originalUrl}`, 'NOT_FOUND', 404);
});

// Centralized error handler
app.use(errorHandler);

export default app;
