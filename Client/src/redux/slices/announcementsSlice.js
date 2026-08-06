import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const getAnnouncements = createAsyncThunk(
  'announcements/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/announcements');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to fetch announcements');
    }
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcements/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post('/announcements', payload);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to post announcement');
    }
  }
);

export const updateAnnouncement = createAsyncThunk(
  'announcements/update',
  async ({ id, title, message }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/announcements/${id}`, { title, message });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to update announcement');
    }
  }
);

export const deleteAnnouncement = createAsyncThunk(
  'announcements/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/announcements/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || 'Failed to delete announcement');
    }
  }
);

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    list: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAnnouncementsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAnnouncements
      .addCase(getAnnouncements.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getAnnouncements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(getAnnouncements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // createAnnouncement
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // updateAnnouncement
      .addCase(updateAnnouncement.fulfilled, (state, action) => {
        const index = state.list.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      // deleteAnnouncement
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  },
});

export const { clearAnnouncementsError } = announcementsSlice.actions;
export default announcementsSlice.reducer;
