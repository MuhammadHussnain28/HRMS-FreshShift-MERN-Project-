import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProfilePage from '@/pages/profile/ProfilePage';
import EmployeesListPage from '@/pages/employees/EmployeesListPage';
import AttendancePage from '@/pages/attendance/AttendancePage';
import AdminAttendancePage from '@/pages/attendance/AdminAttendancePage';
import LeavesPage from '@/pages/leaves/LeavesPage';
import AdminLeavesPage from '@/pages/leaves/AdminLeavesPage';
import AnnouncementsPage from '@/pages/announcements/AnnouncementsPage';
import PayrollPage from '@/pages/payroll/PayrollPage';
import AdminPayrollPage from '@/pages/payroll/AdminPayrollPage';
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';
import NotFoundPage from '@/pages/errors/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      {/* Shared Authenticated Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/announcements" 
        element={
          <ProtectedRoute>
            <AnnouncementsPage />
          </ProtectedRoute>
        } 
      />

      {/* Employee-Only Routes */}
      <Route 
        path="/attendance" 
        element={
          <RoleRoute roles={['employee']}>
            <AttendancePage />
          </RoleRoute>
        } 
      />
      <Route 
        path="/leaves" 
        element={
          <RoleRoute roles={['employee']}>
            <LeavesPage />
          </RoleRoute>
        } 
      />
      <Route 
        path="/payroll" 
        element={
          <RoleRoute roles={['employee']}>
            <PayrollPage />
          </RoleRoute>
        } 
      />

      {/* HR Admin-Only Routes */}
      <Route 
        path="/admin/employees" 
        element={
          <RoleRoute roles={['hr_admin']}>
            <EmployeesListPage />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/attendance" 
        element={
          <RoleRoute roles={['hr_admin']}>
            <AdminAttendancePage />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/leaves" 
        element={
          <RoleRoute roles={['hr_admin']}>
            <AdminLeavesPage />
          </RoleRoute>
        } 
      />
      <Route 
        path="/admin/payroll" 
        element={
          <RoleRoute roles={['hr_admin']}>
            <AdminPayrollPage />
          </RoleRoute>
        } 
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
