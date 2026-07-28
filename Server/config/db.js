import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};
