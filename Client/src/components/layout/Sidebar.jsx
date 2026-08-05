import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Clock, 
  CalendarDays, 
  Wallet, 
  Megaphone, 
  Users,
  ShieldCheck,
  Building2
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import freshshiftsLogo from '@/assets/freshshifts-logo.jpg';

export default function Sidebar({ onCloseMobile }) {
  const { user, isAdmin } = useAuth();

  // Navigation Items driven strictly by Section 4 Role Capability Matrix
  const employeeLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Attendance', to: '/attendance', icon: Clock },
    { label: 'My Leaves', to: '/leaves', icon: CalendarDays },
    { label: 'My Payslips', to: '/payroll', icon: Wallet },
    { label: 'Announcements', to: '/announcements', icon: Megaphone },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', to: '/profile', icon: User },
    { label: 'Manage Employees', to: '/admin/employees', icon: Users },
    { label: 'All Attendance', to: '/admin/attendance', icon: Clock },
    { label: 'Leave Requests', to: '/admin/leaves', icon: CalendarDays },
    { label: 'Payroll Engine', to: '/admin/payroll', icon: Wallet },
    { label: 'Announcements', to: '/announcements', icon: Megaphone },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <img src={freshshiftsLogo} alt="FreshShifts" className="h-8 w-auto bg-white rounded p-0.5" />
        <div>
          <span className="font-extrabold text-white text-base tracking-tight block">
            FRESHSHIFTS
          </span>
          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
            {isAdmin ? 'HR Admin Control' : 'Employee Portal'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Role Card Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal/20 border border-teal/40 text-sky-300 font-bold flex items-center justify-center text-sm shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
            <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
              isAdmin ? 'bg-red-950 text-red-400 border border-red-800/50' : 'bg-sky-950 text-sky-400 border border-sky-800/50'
            }`}>
              {user?.role === 'hr_admin' ? 'HR Administrator' : 'Employee'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
