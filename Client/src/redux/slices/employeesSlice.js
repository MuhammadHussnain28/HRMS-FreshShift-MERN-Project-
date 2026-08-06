import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const getMyProfile = createAsyncThunk(
  'employees/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/employees/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to load profile');
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'employees/updateMyProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put('/employees/me', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update profile');
    }
  }
);

export const getEmployees = createAsyncThunk(
  'employees/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/employees');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch employees');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/auth/register', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to onboard employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/employees/${id}`, payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update employee');
    }
  }
);

export const deactivateEmployee = createAsyncThunk(
  'employees/deactivate',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/employees/${id}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to deactivate employee');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    myProfile: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearEmployeesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getMyProfile
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      })
      // updateMyProfile
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.myProfile = action.payload;
      })
      // getEmployees
      .addCase(getEmployees.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(getEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // createEmployee
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      // updateEmployee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.list.findIndex((emp) => emp._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // deactivateEmployee
      .addCase(deactivateEmployee.fulfilled, (state, action) => {
        const index = state.list.findIndex((emp) => emp._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export const { clearEmployeesError } = employeesSlice.actions;
export default employeesSlice.reducer;
