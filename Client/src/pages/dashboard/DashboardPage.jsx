import React from 'react';
import useAuth from '../../hooks/useAuth';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
}
