import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const selfProfileSchema = z.object({
  phone: z.string().max(20, 'Phone must be under 20 characters').optional().or(z.literal('')),
});

export const addEmployeeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['employee', 'hr_admin']),
  department: z.string().trim().min(1, 'Department is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  phone: z.string().optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  monthlySalary: z.coerce.number().min(0, 'Salary must be a positive number'),
});

export const editEmployeeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['employee', 'hr_admin']),
  department: z.string().trim().min(1, 'Department is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  phone: z.string().optional().or(z.literal('')),
  joiningDate: z.string().optional().or(z.literal('')),
  monthlySalary: z.coerce.number().min(0, 'Salary must be a positive number'),
  employmentStatus: z.enum(['active', 'inactive', 'terminated']),
});

export const leaveRequestSchema = z
  .object({
    leaveType: z.enum(['casual', 'sick', 'annual']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z.string().trim().min(5, 'Reason must be at least 5 characters').max(300, 'Reason must be under 300 characters'),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const announcementSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(100, 'Title must be under 100 characters'),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(1000, 'Message must be under 1000 characters'),
});

export const generatePayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee selection is required'),
  month: z.coerce.number().min(1, 'Month must be 1 to 12').max(12, 'Month must be 1 to 12'),
  year: z.coerce.number().min(2000, 'Year must be 2000 or later').max(2100, 'Year invalid'),
});
