import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import useAuth from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Topbar({ onToggleMobileMenu }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-lg text-xs font-extrabold">
              <Shield className="w-3.5 h-3.5" /> HR Admin Workspace
            </span>
          ) : (
            <span className="text-slate-800 font-bold">Employee Workspace</span>
          )}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info Capsule */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-teal text-white font-bold text-xs flex items-center justify-center">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 px-3 py-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
