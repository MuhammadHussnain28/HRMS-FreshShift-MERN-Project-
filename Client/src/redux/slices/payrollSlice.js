import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const generatePayroll = createAsyncThunk(
  'payroll/generate',
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/payroll/generate', { employeeId, month, year });
      return data.data;
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error?.message;
      if (status === 409) {
        return rejectWithValue({ isDuplicate: true, message: message || 'Payroll already generated for this month and year' });
      }
      return rejectWithValue({ isDuplicate: false, message: message || 'Failed to generate payroll' });
    }
  }
);

export const getPayrollHistory = createAsyncThunk(
  'payroll/getHistory',
  async (employeeId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/payroll/${employeeId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch payroll history');
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    history: [],
    currentGenerated: null,
    status: 'idle',
    error: null,
    duplicateConflict: null,
  },
  reducers: {
    clearPayrollState: (state) => {
      state.error = null;
      state.duplicateConflict = null;
      state.currentGenerated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getPayrollHistory
      .addCase(getPayrollHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getPayrollHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload;
      })
      .addCase(getPayrollHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // generatePayroll
      .addCase(generatePayroll.pending, (state) => {
        state.error = null;
        state.duplicateConflict = null;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.currentGenerated = action.payload;
        state.history.unshift(action.payload);
        state.error = null;
        state.duplicateConflict = null;
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        if (action.payload?.isDuplicate) {
          state.duplicateConflict = action.payload.message;
        } else {
          state.error = action.payload?.message || 'Failed to generate payroll';
        }
      });
  },
});

export const { clearPayrollState } = payrollSlice.actions;
export default payrollSlice.reducer;
