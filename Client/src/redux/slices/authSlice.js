import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';
import axios from 'axios';

const initialAccessToken = localStorage.getItem('accessToken');
const initialRefreshToken = localStorage.getItem('refreshToken');

const initialState = {
  user: null,
  accessToken: initialAccessToken || null,
  refreshToken: initialRefreshToken || null,
  isAuthenticated: !!initialAccessToken,
  isBootstrapping: true,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
      const { data } = await axios.post(`${baseURL}/auth/login`, { email, password });
      
      const payload = data.data; // { accessToken, refreshToken, user }
      dispatch(setCredentials(payload));
      return payload;
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Invalid email or password';
      return rejectWithValue(errorMsg);
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { accessToken, refreshToken } = getState().auth;
    if (!accessToken && !refreshToken) {
      dispatch(setBootstrapping(false));
      return null;
    }

    try {
      const { data } = await axiosInstance.get('/employees/me');
      const user = data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      return user;
    } catch (err) {
      dispatch(logout());
      return rejectWithValue(err.response?.data?.error || 'Session expired');
    } finally {
      dispatch(setBootstrapping(false));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      if (user !== undefined) state.user = user;
      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        if (accessToken) localStorage.setItem('accessToken', accessToken);
        else localStorage.removeItem('accessToken');
      }
      if (refreshToken !== undefined) {
        state.refreshToken = refreshToken;
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        else localStorage.removeItem('refreshToken');
      }
      state.isAuthenticated = !!state.accessToken;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setBootstrapping: (state, action) => {
      state.isBootstrapping = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout, setBootstrapping } = authSlice.actions;
export default authSlice.reducer;
