import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployees } from '../../redux/slices/employeesSlice';
import { generatePayroll, clearPayrollState } from '../../redux/slices/payrollSlice';
import axiosInstance from '../../lib/axiosInstance';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generatePayrollSchema } from '../../lib/validators';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Wallet, 
  Sparkles, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  BadgeDollarSign, 
  Calendar, 
  Building2, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function AdminPayrollPage() {
  const dispatch = useDispatch();
  const { list: employees } = useSelector((state) => state.employees);
  const { currentGenerated, error, duplicateConflict } = useSelector((state) => state.payroll);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const currentDate = new Date();
  const currentMonthNum = currentDate.getMonth() + 1; // 1-12
  const currentYearNum = currentDate.getFullYear();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      employeeId: '',
      month: currentMonthNum,
      year: currentYearNum,
    },
  });

  const selectedEmployeeId = watch('employeeId');

  useEffect(() => {
    dispatch(getEmployees());
    return () => {
      dispatch(clearPayrollState());
    };
  }, [dispatch]);

  const onSubmit = async (values) => {
    dispatch(clearPayrollState());
    setIsSubmitting(true);
    const action = await dispatch(generatePayroll(values));
    setIsSubmitting(false);

    if (generatePayroll.fulfilled.match(action)) {
      toast.success('Payroll calculated and generated successfully!');
    }
  };

  const handleDownloadPdf = async (payroll) => {
    setDownloadingId(payroll._id);
    try {
      const response = await axiosInstance.get(`/payroll/${payroll._id}/download`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${payroll.month}-${payroll.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Payslip PDF downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download payslip PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const selectedEmployeeObj = employees.find((e) => e._id === selectedEmployeeId);

  const monthsList = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payroll Calculation Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated salary computation with unpaid leave deductions & PDF payslip generation</p>
        </div>
      </div>

      {/* Generation Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal" /> Generate Monthly Payslip
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Select an employee and pay period to calculate deductions and net salary</p>
        </div>

        {/* Specific 409 Duplicate Payslip Conflict Banner (Section 15 Named Exception) */}
        {duplicateConflict && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-sm">Payslip Already Generated</p>
                <p className="text-xs text-amber-700 mt-0.5">{duplicateConflict}</p>
              </div>
            </div>
            {selectedEmployeeId && (
              <Button
                type="button"
                onClick={() => {
                  toast.info('Viewing existing payslip in employee profile history.');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5 shrink-0"
              >
                <span>View Existing Payslip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Generic Error Banner */}
        {error && !duplicateConflict && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payroll Generation Error</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Employee Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Employee *
              </label>
              <select
                {...register('employeeId')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 ${errors.employeeId ? 'border-red-300' : 'border-slate-200'}`}
              >
                <option value="">Choose Employee...</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department || 'Staff'})
                  </option>
                ))}
              </select>
              {errors.employeeId && <p className="text-xs text-red-600 font-medium mt-1">{errors.employeeId.message}</p>}
            </div>

            {/* Month Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pay Month *
              </label>
              <select
                {...register('month')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
              >
                {monthsList.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pay Year *
              </label>
              <input
                type="number"
                {...register('year')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 ${errors.year ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.year && <p className="text-xs text-red-600 font-medium mt-1">{errors.year.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-7 py-3 shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Computing Payroll...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal" /> Run Payroll Calculation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Generated Breakdown Card (BACKEND_SPEC Section 7.2) */}
      {currentGenerated && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">Payroll Generated</span>
                <h3 className="text-xl font-extrabold tracking-tight">
                  Statement for {selectedEmployeeObj?.name || 'Employee'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Period: {monthsList.find((m) => m.value === Number(currentGenerated.month))?.label} {currentGenerated.year}
                </p>
              </div>
            </div>

            <Button
              onClick={() => handleDownloadPdf(currentGenerated)}
              disabled={downloadingId === currentGenerated._id}
              className="bg-teal hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl px-5 py-2.5 shadow-md flex items-center gap-2"
            >
              {downloadingId === currentGenerated._id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download PDF Payslip</span>
            </Button>
          </div>

          {/* Breakdown Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Base Monthly Salary</span>
              <span className="text-lg font-bold text-white font-mono block">
                ${currentGenerated.baseSalary ? currentGenerated.baseSalary.toLocaleString() : 0}
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unpaid Leave Days</span>
              <span className="text-lg font-bold text-amber-400 font-mono block">
                {currentGenerated.unpaidLeaveDays || 0} day(s)
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Calculated Deduction</span>
              <span className="text-lg font-bold text-red-400 font-mono block">
                -${currentGenerated.deduction ? currentGenerated.deduction.toLocaleString() : 0}
              </span>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-800/60 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Final Net Salary</span>
              <span className="text-2xl font-black text-emerald-300 font-mono block">
                ${currentGenerated.netSalary ? currentGenerated.netSalary.toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
