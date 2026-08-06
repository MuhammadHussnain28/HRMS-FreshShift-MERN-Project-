import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/authSlice';
import employeesReducer from '../redux/slices/employeesSlice';
import attendanceReducer from '../redux/slices/attendanceSlice';
import leaveReducer from '../redux/slices/leaveSlice';
import announcementsReducer from '../redux/slices/announcementsSlice';
import payrollReducer from '../redux/slices/payrollSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    attendance: attendanceReducer,
    leave: leaveReducer,
    announcements: announcementsReducer,
    payroll: payrollReducer,
  },
});
