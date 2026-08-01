import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import { generatePayroll } from '../services/payrollService.js';
import { generatePayslipPdf } from '../services/payslipPdfService.js';
import { sendSuccess, sendError } from '../utils/response.js';

// @desc    Generate payroll for an employee
// @route   POST /api/payroll/generate
// @access  Private (HR Admin)
export const generatePayrollController = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;

    const payroll = await generatePayroll(employeeId, month, year, req.user.id);
    return sendSuccess(res, payroll, 'Payroll generated successfully', 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Payroll already generated for this month and year', null, 409);
    }
    next(error);
  }
};

// @desc    Get payroll history for an employee
// @route   GET /api/payroll/:employeeId
// @access  Private (Owner or HR Admin)
export const getEmployeePayroll = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (req.user.role !== 'hr_admin' && req.user.id !== employeeId) {
      return sendError(res, 'Access denied. Insufficient permissions.', null, 403);
    }

    const payrolls = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 });
    return sendSuccess(res, payrolls, 'Payroll history retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

// @desc    Download payslip PDF
// @route   GET /api/payroll/:id/download
// @access  Private (Owner or HR Admin)
export const downloadPayslip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employee');
    
    if (!payroll) {
      return sendError(res, 'Payroll not found', null, 404);
    }

    if (req.user.role !== 'hr_admin' && req.user.id !== payroll.employee._id.toString()) {
      return sendError(res, 'Access denied. Insufficient permissions.', null, 403);
    }

    const pdfBuffer = await generatePayslipPdf(payroll, payroll.employee);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=payslip-${payroll.month}-${payroll.year}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
