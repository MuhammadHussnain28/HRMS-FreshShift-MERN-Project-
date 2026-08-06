import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';
import { getAllAttendance } from './attendanceSlice';

export const submitLeave = createAsyncThunk(
  'leave/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/leaves', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to submit leave request');
    }
  }
);

export const getMyLeaves = createAsyncThunk(
  'leave/getMine',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/leaves/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch your leaves');
    }
  }
);

export const getAllLeaves = createAsyncThunk(
  'leave/getAll',
  async (statusFilter, { rejectWithValue }) => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await axiosInstance.get('/leaves', { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch leave requests');
    }
  }
);

export const decideLeave = createAsyncThunk(
  'leave/decide',
  async ({ id, decision }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/leaves/${id}/decision`, { decision });
      // Approval creates on-leave Attendance records (BACKEND_SPEC.md 7.1 step 8) —
      // manually re-fetch attendance so HR Admin attendance view updates automatically without page refresh.
      if (decision === 'approved') {
        dispatch(getAllAttendance());
      }
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to submit decision');
    }
  }
);

export const getMyBalance = createAsyncThunk(
  'leave/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/leaves/balance/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch leave balances');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState: {
    myLeaves: [],
    allLeaves: [],
    balance: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getMyLeaves
      .addCase(getMyLeaves.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myLeaves = action.payload;
      })
      .addCase(getMyLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // getMyBalance
      .addCase(getMyBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      // submitLeave
      .addCase(submitLeave.fulfilled, (state, action) => {
        state.myLeaves.unshift(action.payload);
        state.error = null;
      })
      .addCase(submitLeave.rejected, (state, action) => {
        state.error = action.payload;
      })
      // getAllLeaves
      .addCase(getAllLeaves.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAllLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allLeaves = action.payload;
      })
      .addCase(getAllLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // decideLeave
      .addCase(decideLeave.fulfilled, (state, action) => {
        const index = state.allLeaves.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.allLeaves[index] = action.payload;
        }
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
