import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    unpaidLeaveDays: {
      type: Number,
      required: true,
      default: 0,
    },
    deduction: {
      type: Number,
      required: true,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
