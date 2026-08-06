import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyLeaves, getMyBalance, submitLeave } from '../../redux/slices/leaveSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leaveRequestSchema } from '../../lib/validators';
import { Button } from '@/components/ui/button';
import StatusBadge from '../../components/shared/StatusBadge';
import { toast } from 'sonner';
import { 
  CalendarDays, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Calendar as CalendarIcon, 
  FileText, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export default function LeavesPage() {
  const dispatch = useDispatch();
  const { myLeaves, balance, status, error: serverError } = useSelector((state) => state.leave);

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leaveType: 'casual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    },
  });

  const startDateVal = watch('startDate');
  const endDateVal = watch('endDate');

  useEffect(() => {
    dispatch(getMyLeaves());
    dispatch(getMyBalance());
  }, [dispatch]);

  // Live Day-Count Duration Calculation Preview
  const calculateDays = () => {
    if (!startDateVal || !endDateVal) return 0;
    const start = new Date(startDateVal);
    const end = new Date(endDateVal);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const dayCount = calculateDays();

  const onSubmit = async (values) => {
    setFormError(null);
    setIsSubmitting(true);
    const action = await dispatch(submitLeave(values));
    setIsSubmitting(false);

    if (submitLeave.fulfilled.match(action)) {
      toast.success('Leave request submitted successfully!');
      reset();
      dispatch(getMyBalance()); // Refetch balances
    } else {
      // On 400 (balance exceeded or invalid dates), show the server's specific message inline on the form
      setFormError(action.payload || 'Failed to submit leave request');
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
          <CalendarDays className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leave Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track balances, request time off, and view request history</p>
        </div>
      </div>

      {/* Leave Balances Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Casual Leave */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Casual Leave</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {balance?.casual ? balance.casual.remaining : 10} <span className="text-sm font-semibold text-slate-400">/ {balance?.casual ? balance.casual.allowed : 10} Days</span>
              </h3>
            </div>
            <div className="p-2.5 bg-sky-50 text-teal rounded-2xl border border-sky-100">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-teal h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, ((balance?.casual?.used || 0) / (balance?.casual?.allowed || 10)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {balance?.casual?.used || 0} day(s) used • {balance?.casual?.remaining || 10} day(s) remaining
          </p>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Sick Leave</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {balance?.sick ? balance.sick.remaining : 8} <span className="text-sm font-semibold text-slate-400">/ {balance?.sick ? balance.sick.allowed : 8} Days</span>
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, ((balance?.sick?.used || 0) / (balance?.sick?.allowed || 8)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {balance?.sick?.used || 0} day(s) used • {balance?.sick?.remaining || 8} day(s) remaining
          </p>
        </div>

        {/* Annual Leave */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Annual Leave</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {balance?.annual ? balance.annual.remaining : 14} <span className="text-sm font-semibold text-slate-400">/ {balance?.annual ? balance.annual.allowed : 14} Days</span>
              </h3>
            </div>
            <div className="p-2.5 bg-sky-50 text-teal rounded-2xl border border-sky-100">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-teal h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, ((balance?.annual?.used || 0) / (balance?.annual?.allowed || 14)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {balance?.annual?.used || 0} day(s) used • {balance?.annual?.remaining || 14} day(s) remaining
          </p>
        </div>
      </div>

      {/* Leave Application Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="pb-4 border-b border-slate-100 mb-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal" /> Request Leave Application
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Submit your time off request for manager approval</p>
        </div>

        {/* Inline Server 400 Error Banner */}
        {formError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Leave Request Declined</p>
              <p className="text-xs text-red-600 mt-0.5">{formError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Leave Type Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Leave Category *
              </label>
              <select
                {...register('leaveType')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register('startDate')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 ${errors.startDate ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.startDate && <p className="text-xs text-red-600 font-medium mt-1">{errors.startDate.message}</p>}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                End Date *
              </label>
              <input
                type="date"
                {...register('endDate')}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 ${errors.endDate ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.endDate && <p className="text-xs text-red-600 font-medium mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Reason Textarea & Live Day Duration Badge */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Reason for Leave *
              </label>
              <span className="text-xs font-bold text-teal bg-teal/10 px-3 py-1 rounded-full border border-teal/20">
                Total Duration: {dayCount} day(s)
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Briefly state your reason for requesting leave..."
              {...register('reason')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 ${errors.reason ? 'border-red-300' : 'border-slate-200'}`}
            />
            {errors.reason && <p className="text-xs text-red-600 font-medium mt-1">{errors.reason.message}</p>}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm px-7 py-3 shadow-md flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Leave Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Own Leave Request History Table (Decision #3: StatusBadge ONLY - NO AI info rendered here!) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" /> My Submitted Leave Requests
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Historical log of all submitted leave applications</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
            Total Requests: {myLeaves.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
            <p className="text-sm font-semibold">Loading leave requests...</p>
          </div>
        ) : myLeaves.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <CalendarDays className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No leave requests submitted yet</p>
            <p className="text-xs text-slate-400 mt-1">Use the form above to submit your first leave application.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Leave Category</th>
                  <th className="py-3.5 px-6">Dates</th>
                  <th className="py-3.5 px-6">Days</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {myLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 capitalize">
                      {leave.leaveType} Leave
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-mono text-xs">
                      {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {leave.numberOfDays} day(s)
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
