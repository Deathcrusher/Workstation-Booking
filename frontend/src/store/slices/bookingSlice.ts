import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export interface Booking {
  id: string;
  roomId: string;
  bandId: string;
  start: string;
  end: string;
  room: {
    id: string;
    name: string;
    color: string;
  };
  band: {
    id: string;
    name: string;
  };
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

interface BookingFilters {
  roomId?: string;
  start?: string;
  end?: string;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk<Booking[], BookingFilters | undefined>(
  'bookings/fetch',
  async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.roomId) {
      queryParams.append('roomId', filters.roomId);
    }
    
    if (filters.start) {
      queryParams.append('start', filters.start);
    }
    
    if (filters.end) {
      queryParams.append('end', filters.end);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/bookings?${queryString}` : '/bookings';
    
    const response = await api.get<Booking[]>(url);
    return response.data;
  }
);

export const createBooking = createAsyncThunk<Booking, { roomId: string; bandId: string; start: string; end: string }>(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const { data } = await api.post<Booking>('/bookings', bookingData);
      return data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const updateBooking = createAsyncThunk<Booking, { id: string; data: Partial<Booking> }>(
  'bookings/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: responseData } = await api.put<Booking>(`/bookings/${id}`, data);
      return responseData;
    } catch (error: any) {
      console.error('Error updating booking:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  }
);

export const deleteBooking = createAsyncThunk<string, string>(
  'bookings/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/bookings/${id}`);
      return id;
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bookings
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookings';
      })
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.push(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create booking';
      })
      // Update booking
      .addCase(updateBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(
          (booking) => booking.id === action.payload.id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.selectedBooking?.id === action.payload.id) {
          state.selectedBooking = action.payload;
        }
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update booking';
      })
      // Delete booking
      .addCase(deleteBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== action.payload
        );
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
      })
      .addCase(deleteBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete booking';
      });
  },
});

export const { clearError, setSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer; 