import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBalance, getMyLeaves } from '../../redux/slices/leaveSlice';
import { getAnnouncements } from '../../redux/slices/announcementsSlice';
import ClockCard from '../../components/attendance/ClockCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  CalendarDays, 
  Megaphone, 
  FileText, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  User, 
  Building2 
} from 'lucide-react';
import dashboardImg1 from '@/assets/Dashnoard-img1.svg';

export default function EmployeeDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, myLeaves } = useSelector((state) => state.leave);
  const { list: announcements } = useSelector((state) => state.announcements);

  useEffect(() => {
    dispatch(getMyBalance());
    dispatch(getMyLeaves());
    dispatch(getAnnouncements());
  }, [dispatch]);

  // Greeting Time of Day Helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const recentAnnouncements = announcements.slice(0, 3);
  const recentLeaves = myLeaves.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* BLOCK 1: Executive Greeting Hero Header featuring Dashnoard-img1.svg */}
      <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white">
        {/* <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 lg:opacity-30 pointer-events-none hidden md:block border-3 border-yellow">
          <img src={dashboardImg1} alt="Employee Dashboard Graphics" className="w-80 h-80 object-contain object-right p-4" />
        </div> */}


        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 lg:opacity-60 pointer-events-none hidden md:flex flex items-center justify-center">
          <img src={dashboardImg1} alt="Employee Dashboard Graphics" className="ml-27 w-[360px] h-[360px] object-contain object-center p-4" />
        </div>



        <div className="relative z-10 p-6 sm:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal/20 border border-teal/40 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> FreshShifts Employee Portal
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {getGreeting()}, <span className="text-teal">{user?.name || 'Team Member'}</span> 
          </h1>
          
          <p className="text-sm text-slate-300 mt-2 font-medium leading-relaxed">
            Welcome back to your workspace. Track shift hours, request time off, and stay updated with company news.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-300 font-semibold border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Building2 className="w-3.5 h-3.5 text-teal" />
              <span>Department: <strong className="text-white">{user?.department || 'Operations'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Role: <strong className="text-white capitalize">{user?.designation || user?.role}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Today: <strong className="text-white">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 2: Reused Standalone ClockCard */}
      <div>
        <ClockCard />
      </div>

      {/* BLOCK 3: Leave Balances Stat Cards Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-teal" /> Leave Balances Overview
          </h3>
          <Link to="/leaves" className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
            Manage Leaves <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Casual Leave Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Casual Leave</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">
                  {balance?.casual ? balance.casual.remaining : 10} <span className="text-xs font-semibold text-slate-400">/ {balance?.casual ? balance.casual.allowed : 10} Days</span>
                </h4>
              </div>
              <div className="p-2.5 bg-sky-50 text-teal rounded-2xl border border-sky-100">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-teal h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((balance?.casual?.used || 0) / (balance?.casual?.allowed || 10)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {balance?.casual?.used || 0} used • {balance?.casual?.remaining || 10} remaining
            </p>
          </div>

          {/* Sick Leave Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Sick Leave</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">
                  {balance?.sick ? balance.sick.remaining : 8} <span className="text-xs font-semibold text-slate-400">/ {balance?.sick ? balance.sick.allowed : 8} Days</span>
                </h4>
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
              {balance?.sick?.used || 0} used • {balance?.sick?.remaining || 8} remaining
            </p>
          </div>

          {/* Annual Leave Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Annual Leave</span>
                <h4 className="text-2xl font-black text-slate-900 mt-1">
                  {balance?.annual ? balance.annual.remaining : 14} <span className="text-xs font-semibold text-slate-400">/ {balance?.annual ? balance.annual.allowed : 14} Days</span>
                </h4>
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
              {balance?.annual?.used || 0} used • {balance?.annual?.remaining || 14} remaining
            </p>
          </div>
        </div>
      </div>

      {/* BLOCK 4: Recent Activity Split Grid (Announcements + Own Leaves) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Announcements Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-teal" /> Latest Company Broadcasts
              </h3>
              <Link to="/announcements" className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAnnouncements.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No active announcements broadcasted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((item) => (
                  <div key={item._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 font-medium">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Own Leave Requests (Decision #3 Compliance: StatusBadge ONLY) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" /> Recent Leave Applications
              </h3>
              <Link to="/leaves" className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
                Apply Leave <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                You have not submitted any leave applications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLeaves.map((leave) => (
                  <div key={leave._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 capitalize">{leave.leaveType} Leave</span>
                        <span className="text-xs font-mono text-slate-500">({leave.numberOfDays}d)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Decision #3: StatusBadge ONLY - NO AI info rendered */}
                    <StatusBadge status={leave.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
