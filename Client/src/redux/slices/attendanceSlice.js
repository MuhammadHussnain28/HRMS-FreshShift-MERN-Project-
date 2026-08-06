import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

const getTodayString = () => new Date().toISOString().split('T')[0];

export const clockIn = createAsyncThunk(
  'attendance/clockIn',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/attendance/clock-in');
      return data.data;
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error?.message;

      if (status === 409) {
        return rejectWithValue(message || 'You have already clocked in for today.');
      }
      return rejectWithValue(message || 'Failed to clock in');
    }
  }
);

export const clockOut = createAsyncThunk(
  'attendance/clockOut',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/attendance/clock-out');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to clock out');
    }
  }
);

export const getMyAttendance = createAsyncThunk(
  'attendance/getMyAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/attendance/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch attendance history');
    }
  }
);

export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/attendance', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch org attendance');
    }
  }
);

export const getEmployeeAttendance = createAsyncThunk(
  'attendance/getEmployeeAttendance',
  async (employeeId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/attendance/${employeeId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch employee attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    myRecords: [],
    allRecords: [],
    selectedEmployeeRecords: [],
    todayRecord: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getMyAttendance
      .addCase(getMyAttendance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myRecords = action.payload;
        const todayStr = getTodayString();
        state.todayRecord = action.payload.find((rec) => rec.date === todayStr) || null;
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // clockIn
      .addCase(clockIn.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
        state.myRecords.unshift(action.payload);
        state.error = null;
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.error = action.payload;
      })
      // clockOut
      .addCase(clockOut.fulfilled, (state, action) => {
        state.todayRecord = action.payload;
        const index = state.myRecords.findIndex((rec) => rec._id === action.payload._id);
        if (index !== -1) {
          state.myRecords[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.error = action.payload;
      })
      // getAllAttendance
      .addCase(getAllAttendance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allRecords = action.payload;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // getEmployeeAttendance
      .addCase(getEmployeeAttendance.fulfilled, (state, action) => {
        state.selectedEmployeeRecords = action.payload;
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
