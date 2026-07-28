import './config/env.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import logger from './utils/logger.js';

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@freshshifts.com',
    password: 'Admin@123',
    role: 'hr_admin',
    department: 'Human Resources',
    designation: 'HR Manager',
    phone: '+923001234567',
    joiningDate: new Date('2024-01-15'),
    monthlySalary: 150000,
    employmentStatus: 'active',
  },
  {
    name: 'Ali Hassan',
    email: 'ali.hassan@freshshifts.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '+923012345678',
    joiningDate: new Date('2024-03-01'),
    monthlySalary: 80000,
    employmentStatus: 'active',
  },
  {
    name: 'Sara Ahmed',
    email: 'sara.ahmed@freshshifts.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Marketing',
    designation: 'Marketing Executive',
    phone: '+923023456789',
    joiningDate: new Date('2024-06-15'),
    monthlySalary: 70000,
    employmentStatus: 'active',
  },
  {
    name: 'Usman Khan',
    email: 'usman.khan@freshshifts.com',
    password: 'Employee@123',
    role: 'employee',
    department: 'Finance',
    designation: 'Accountant',
    phone: '+923034567890',
    joiningDate: new Date('2025-01-10'),
    monthlySalary: 75000,
    employmentStatus: 'active',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    const count = await User.countDocuments();
    if (count > 0) {
      logger.info('Database already has users. Skipping seed. Exiting.');
      process.exit(0);
    }

    await User.create(seedUsers);

    logger.info('=== Seed Complete ===');
    logger.info('Demo accounts created:');
    logger.info('');
    logger.info('HR Admin:');
    logger.info('  Email:    admin@freshshifts.com');
    logger.info('  Password: Admin@123');
    logger.info('');
    logger.info('Employees:');
    logger.info('  Email:    ali.hassan@freshshifts.com');
    logger.info('  Email:    sara.ahmed@freshshifts.com');
    logger.info('  Email:    usman.khan@freshshifts.com');
    logger.info('  Password: Employee@123 (all employees)');
    logger.info('');
    logger.info('=== Done ===');

    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seed();
