import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clockIn, clockOut } from '../../redux/slices/attendanceSlice';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Timer, 
  AlertCircle, 
  Loader2, 
  Sparkles 
} from 'lucide-react';

export default function ClockCard() {
  const dispatch = useDispatch();
  const { todayRecord } = useSelector((state) => state.attendance);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Live Timer Calculation while Clocked In
  useEffect(() => {
    let interval = null;

    if (todayRecord?.clockIn && !todayRecord?.clockOut) {
      const calculateElapsed = () => {
        const start = new Date(todayRecord.clockIn).getTime();
        const now = new Date().getTime();
        const diffMs = Math.max(0, now - start);

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        const pad = (n) => String(n).padStart(2, '0');
        setElapsedTime(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      };

      calculateElapsed();
      interval = setInterval(calculateElapsed, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [todayRecord]);

  const handleClockIn = async () => {
    setIsSubmitting(true);
    const action = await dispatch(clockIn());
    setIsSubmitting(false);

    if (clockIn.fulfilled.match(action)) {
      toast.success('Successfully clocked in for today!');
    } else {
      const errorMsg = action.payload || 'Failed to clock in';
      toast.error(errorMsg);
    }
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    const action = await dispatch(clockOut());
    setIsSubmitting(false);

    if (clockOut.fulfilled.match(action)) {
      toast.success('Successfully clocked out! Great work today.');
    } else {
      toast.error(action.payload || 'Failed to clock out');
    }
  };

  // Helper to format ISO timestamps cleanly
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  // Calculate total work duration after clock-out
  const getCompletedDuration = () => {
    if (!todayRecord?.clockIn || !todayRecord?.clockOut) return '—';
    const start = new Date(todayRecord.clockIn).getTime();
    const end = new Date(todayRecord.clockOut).getTime();
    const diffMs = Math.max(0, end - start);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // 1. Clocked Out State
  if (todayRecord?.clockOut) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-extrabold tracking-tight">Shift Completed</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Finished
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Clocked in at <strong className="font-bold text-white">{formatTime(todayRecord.clockIn)}</strong> • Clocked out at <strong className="font-bold text-white">{formatTime(todayRecord.clockOut)}</strong>
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3 rounded-2xl text-center min-w-[140px] shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Shift Duration</span>
            <span className="text-lg font-extrabold text-emerald-400 font-mono mt-0.5 block">{getCompletedDuration()}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Clocked In State
  if (todayRecord?.clockIn && !todayRecord?.clockOut) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="p-4 bg-teal/20 border border-teal/40 text-sky-400 rounded-2xl shrink-0 animate-pulse">
              <Timer className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-extrabold tracking-tight">Shift in Progress</h3>
                <span className="bg-teal/20 text-sky-300 border border-teal/40 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Started today at <strong className="font-bold text-white">{formatTime(todayRecord.clockIn)}</strong>
              </p>
            </div>
          </div>

          {/* Live Elapsed Counter & Clock Out Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="bg-slate-800/90 border border-slate-700/80 px-5 py-3 rounded-2xl text-center shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Elapsed Shift Time</span>
              <span className="text-2xl font-black text-sky-300 font-mono tracking-wider mt-0.5 block">{elapsedTime}</span>
            </div>

            <div>
              <Button
                onClick={handleClockOut}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl px-6 py-6 text-sm shadow-lg flex items-center justify-center gap-2 border border-red-500/50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Recording...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" /> Clock Out Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Not Clocked In State
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="p-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Daily Shift Status</h3>
            <p className="text-xs text-slate-500 mt-1">You have not clocked in for today yet.</p>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            onClick={handleClockIn}
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl px-7 py-6 text-sm shadow-md flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Recording...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-teal" /> Clock In For Today
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
