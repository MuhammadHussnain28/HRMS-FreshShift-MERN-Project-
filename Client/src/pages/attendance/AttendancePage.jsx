import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyAttendance } from '../../redux/slices/attendanceSlice';
import ClockCard from '../../components/attendance/ClockCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { myRecords, status, error } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getMyAttendance());
  }, [dispatch]);

  const isLoading = status === 'loading';

  // Format Helper
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (inIso, outIso) => {
    if (!inIso || !outIso) return 'In Progress';
    const start = new Date(inIso).getTime();
    const end = new Date(outIso).getTime();
    const diffMs = Math.max(0, end - start);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">Record daily shifts and view your complete attendance log</p>
        </div>
      </div>

      {/* Standalone ClockCard Component */}
      <ClockCard />

      {/* Attendance History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal" /> Personal Attendance Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Complete record of your historical shift entries</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
            Total Logs: {myRecords.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
            <p className="text-sm font-semibold">Loading attendance history...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-base font-bold">Failed to load attendance logs</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        ) : myRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Clock className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No attendance records found</p>
            <p className="text-xs text-slate-400 mt-1">Clock in today to create your first shift entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Shift Date</th>
                  <th className="py-3.5 px-6">Clock In Time</th>
                  <th className="py-3.5 px-6">Clock Out Time</th>
                  <th className="py-3.5 px-6">Shift Duration</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {myRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700">
                      {formatTime(record.clockIn)}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700">
                      {formatTime(record.clockOut)}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {calculateDuration(record.clockIn, record.clockOut)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={record.status || 'present'} />
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
