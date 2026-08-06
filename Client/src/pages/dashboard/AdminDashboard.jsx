import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployees } from '../../redux/slices/employeesSlice';
import { getAllAttendance } from '../../redux/slices/attendanceSlice';
import { getAllLeaves, decideLeave } from '../../redux/slices/leaveSlice';
import { getAnnouncements } from '../../redux/slices/announcementsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import AiRecommendationBadge from '../../components/shared/AiRecommendationBadge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Megaphone, 
  Building2, 
  ArrowRight, 
  Plus, 
  Loader2 
} from 'lucide-react';
import dashboardImg2 from '@/assets/Dashboard_img2.svg';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { list: employees } = useSelector((state) => state.employees);
  const { allRecords: attendanceRecords } = useSelector((state) => state.attendance);
  const { allLeaves: leaves } = useSelector((state) => state.leave);
  const { list: announcements } = useSelector((state) => state.announcements);

  useEffect(() => {
    dispatch(getEmployees());
    dispatch(getAllAttendance({}));
    dispatch(getAllLeaves('pending'));
    dispatch(getAnnouncements());
  }, [dispatch]);

  // Sanctioned Motion #1: Count-Up Stat Numbers
  const totalEmployees = employees.filter((e) => e.employmentStatus === 'active').length;
  const pendingLeavesCount = leaves.length;

  const todayStr = new Date().toISOString().split('T')[0];
  const presentTodayCount = attendanceRecords.filter(
    (r) => r.date === todayStr && r.clockIn
  ).length;

  // Compute Daily Attendance Trend for Current Month (Recharts)
  const attendanceChartData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const countsByDay = {};
    for (let d = 1; d <= daysInMonth; d++) {
      countsByDay[d] = 0;
    }

    attendanceRecords.forEach((rec) => {
      if (!rec.date) return;
      const recDate = new Date(rec.date);
      if (recDate.getMonth() === currentMonth && recDate.getFullYear() === currentYear && rec.clockIn) {
        const day = recDate.getDate();
        countsByDay[day] = (countsByDay[day] || 0) + 1;
      }
    });

    return Object.keys(countsByDay).map((day) => ({
      day: `Day ${day}`,
      count: countsByDay[day],
    }));
  }, [attendanceRecords]);

  const handleDecision = async (id, decision) => {
    const action = await dispatch(decideLeave({ id, decision }));
    if (decideLeave.fulfilled.match(action)) {
      toast.success(`Leave request ${decision} successfully!`);
    } else {
      toast.error(action.payload || `Failed to ${decision} leave request`);
    }
  };

  const pendingLeavesList = leaves.slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* BLOCK 1: Executive Operations Hero Header featuring Dashboard_img2.svg */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-35 pointer-events-none hidden md:block">
          <img src={dashboardImg2} alt="Executive Operations Hub Graphics" className="w-full h-full object-contain object-right p-4" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal/20 border border-teal/40 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Executive HR Operations Hub
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Welcome, <span className="text-teal">{user?.name || 'HR Administrator'}</span>
          </h1>

          <p className="text-sm text-slate-300 mt-2 font-medium leading-relaxed">
            Real-time workforce intelligence, Smart AI leave decision support, and organizational analytics at a glance.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link to="/admin/employees">
              <Button size="sm" className="bg-teal hover:bg-teal-600 text-white font-bold text-xs rounded-xl px-4 py-2.5 shadow-md flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Employee Directory
              </Button>
            </Link>
            <Link to="/admin/payroll">
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white font-bold text-xs rounded-xl px-4 py-2.5">
                Run Payroll Engine
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Sanctioned Motion #1 Count-Up Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Employees Stat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Active Staff</span>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-black text-slate-900 mt-1"
              >
                {totalEmployees}
              </motion.h3>
            </div>
            <div className="p-3 bg-sky-50 text-teal rounded-2xl border border-sky-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active headcount on system
          </p>
        </div>

        {/* Pending Leave Requests Stat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Pending Leave Reviews</span>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl font-black text-amber-600 mt-1"
              >
                {pendingLeavesCount}
              </motion.h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Insights available for review
          </p>
        </div>

        {/* Present Today Stat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Present Today</span>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl font-black text-emerald-600 mt-1"
              >
                {presentTodayCount}
              </motion.h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Shift attendance clocked today
          </p>
        </div>
      </div>

      {/* BLOCK 3: Recharts Daily Attendance Trend Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal" /> Monthly Daily Attendance Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily breakdown of total employee shift check-ins for the current month</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BLOCK 4: Pending Leave Requests Action List (Framer Motion Card Exit + AI Badges) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-600" /> Pending Leave Requests Requiring Action
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Smart AI decision support insights for pending leave applications</p>
          </div>
          <Link to="/admin/leaves" className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
            View All Pending ({pendingLeavesCount}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingLeavesList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            No pending leave applications awaiting review right now.
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {pendingLeavesList.map((leave) => {
                const emp = leave.employee || {};
                return (
                  <motion.div
                    key={leave._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.35 }}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.name ? emp.name.slice(0, 2).toUpperCase() : 'EM'}
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{emp.name || 'Unknown Employee'}</h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {emp.department || 'Staff'} • <span className="capitalize">{leave.leaveType} Leave ({leave.numberOfDays}d)</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-100">
                        <strong className="text-slate-800">Reason:</strong> {leave.reason}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 w-full lg:w-auto justify-between">
                      <AiRecommendationBadge aiRecommendation={leave.aiRecommendation} showReasoning={false} />

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          size="sm"
                          onClick={() => handleDecision(leave._id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-3.5 py-1.5 shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(leave._id, 'rejected')}
                          className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl px-3.5 py-1.5 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* BLOCK 5: Recent Announcements Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-teal" /> Executive Broadcasts & Announcements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage official broadcasts communicated to company staff</p>
          </div>
          <Link to="/announcements">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> New Announcement
            </Button>
          </Link>
        </div>

        {recentAnnouncements.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs font-medium">
            No announcements broadcasted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAnnouncements.map((item) => (
              <div key={item._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">
                    {item.message}
                  </p>
                </div>
                <Link to="/announcements" className="text-xs font-bold text-teal hover:underline inline-flex items-center gap-1 pt-2">
                  Manage Broadcasts <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
