import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Payroll from '../models/Payroll.js';
import AuditLog from '../models/AuditLog.js';
import { todayYMD } from '../utils/dateUtils.js';

export const computeAbsentDays = async (employeeId, month, year) => {
  const user = await User.findById(employeeId);
  if (!user) throw new Error('Employee not found');

  const joiningDate = user.joiningDate ? new Date(user.joiningDate) : new Date(0);
  // Ensure the joining date has the time zeroed out so we compare properly
  joiningDate.setUTCHours(0, 0, 0, 0);
  
  // start of month in UTC
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  
  // end of month in UTC
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  // Determine the ceiling: end of month or today (whichever is earlier)
  const now = new Date();
  let limitDate = endDate < now ? endDate : now;
  
  // If we're generating for a future month, cap it to now
  if (startDate > now) return 0; // cannot compute for future

  // Get all attendance records for this month
  const attendances = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: `${year}-${String(month).padStart(2, '0')}-01`,
      $lte: `${year}-${String(month).padStart(2, '0')}-31`
    }
  }).lean();
  
  // For easier lookup by date string
  const attendanceSet = new Set(attendances.map(a => a.date));

  // Get all approved leaves that overlap this month
  const approvedLeaves = await Leave.find({
    employee: employeeId,
    status: 'approved',
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  }).lean();

  let absentDays = 0;
  
  // Loop from startDate up to limitDate
  // We'll iterate day by day
  let current = new Date(startDate);
  
  while (current <= limitDate) {
    // If the current date is before joining date, skip it
    if (current >= joiningDate) {
      // get YYYY-MM-DD
      const dateStr = current.toISOString().split('T')[0];
      
      // Is there attendance?
      const hasAttendance = attendanceSet.has(dateStr);
      
      if (!hasAttendance) {
        // Is there an approved leave?
        // Note: we consider Leave ranges (start to end inclusive)
        let hasLeave = false;
        for (const leave of approvedLeaves) {
          const lStart = new Date(leave.startDate).setUTCHours(0, 0, 0, 0);
          const lEnd = new Date(leave.endDate).setUTCHours(23, 59, 59, 999);
          if (current.getTime() >= lStart && current.getTime() <= lEnd) {
            hasLeave = true;
            break;
          }
        }
        
        if (!hasLeave) {
          absentDays++;
        }
      }
    }
    
    // next day
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return absentDays;
};

export const generatePayroll = async (employeeId, month, year, generatedBy) => {
  const user = await User.findById(employeeId);
  if (!user) throw new Error('Employee not found');
  if (!user.monthlySalary) throw new Error('Employee has no base salary configured');

  const absentDays = await computeAbsentDays(employeeId, month, year);
  
  const perDayRate = user.monthlySalary / 30;
  const deduction = perDayRate * absentDays;
  const netSalary = user.monthlySalary - deduction;

  const payroll = new Payroll({
    employee: employeeId,
    month,
    year,
    baseSalary: user.monthlySalary,
    unpaidLeaveDays: absentDays,
    deduction: parseFloat(deduction.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
    generatedBy,
  });

  await payroll.save();

  await AuditLog.create({
    user: generatedBy,
    action: 'PAYROLL_GENERATED',
    targetType: 'Payroll',
    targetId: payroll._id,
    details: { month, year, netSalary: payroll.netSalary }
  });

  return payroll;
};
