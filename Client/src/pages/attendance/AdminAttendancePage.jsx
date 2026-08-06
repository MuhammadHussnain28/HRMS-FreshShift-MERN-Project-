import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../redux/slices/attendanceSlice';
import { getEmployees } from '../../redux/slices/employeesSlice';
import StatusBadge from '../../components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Filter, 
  Calendar, 
  User, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  Building2 
} from 'lucide-react';

export default function AdminAttendancePage() {
  const dispatch = useDispatch();
  const { allRecords, status, error } = useSelector((state) => state.attendance);
  const { list: employees } = useSelector((state) => state.employees);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    dispatch(getEmployees());
    dispatch(getAllAttendance({}));
  }, [dispatch]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    dispatch(getAllAttendance(params));
  };

  const handleResetFilters = () => {
    setSelectedEmployeeId('all');
    setFromDate('');
    setToDate('');
    dispatch(getAllAttendance({}));
  };

  // Client-side Filter by Employee Selection
  const filteredRecords = allRecords.filter((rec) => {
    if (selectedEmployeeId === 'all') return true;
    const empId = typeof rec.employee === 'object' ? rec.employee?._id : rec.employee;
    return empId === selectedEmployeeId;
  });

  const isLoading = status === 'loading';

  // Format Helpers
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal/10 border border-teal/20 text-teal rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Attendance Logs</h1>
            <p className="text-xs text-slate-500 mt-0.5">Filter and review attendance records across all employees</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-teal" /> Filter Records
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Employee Select Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.department || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          {/* From Date Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
            />
          </div>

          {/* To Date Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="flex items-end gap-2">
            <Button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm py-2"
            >
              Apply Filter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-sm py-2 px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Results DataTable */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Attendance Log Results</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
            Records Found: {filteredRecords.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal mb-3" />
            <p className="text-sm font-semibold">Loading organization attendance...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 flex flex-col items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            <p className="text-base font-bold">Failed to load attendance records</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Clock className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-base font-bold text-slate-800">No attendance records match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different date range or employee.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Shift Date</th>
                  <th className="py-3.5 px-6">Clock In</th>
                  <th className="py-3.5 px-6">Clock Out</th>
                  <th className="py-3.5 px-6">Duration</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {filteredRecords.map((record) => {
                  const emp = record.employee || {};
                  return (
                    <tr key={record._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EM'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{emp.name || 'Unknown Employee'}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" /> {emp.department || 'Staff'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
