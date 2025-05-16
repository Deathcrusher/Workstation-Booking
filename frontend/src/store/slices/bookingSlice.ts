import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface Booking {
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

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk<
  Booking[],
  { start?: string; end?: string; roomId?: string } | undefined
>(
  'bookings/fetchAll',
  async (params) => {
    const { data } = await api.get<Booking[]>('/bookings', { params });
    return data;
  }
);

export const createBooking = createAsyncThunk<Booking, { roomId: string; start: string; end: string }>(
  'bookings/create',
  async (bookingData) => {
    const { data } = await api.post<Booking>('/bookings', bookingData);
    return data;
  }
);

export const updateBooking = createAsyncThunk<Booking, { id: string; data: Partial<Booking> }>(
  'bookings/update',
  async ({ id, data }) => {
    const { data: responseData } = await api.put<Booking>(`/bookings/${id}`, data);
    return responseData;
  }
);

export const deleteBooking = createAsyncThunk<string, string>(
  'bookings/delete',
  async (id) => {
    await api.delete(`/bookings/${id}`);
    return id;
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
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
      })
      // Update booking
      .addCase(updateBooking.fulfilled, (state, action) => {
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
      // Delete booking
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(
          (booking) => booking.id !== action.payload
        );
        if (state.selectedBooking?.id === action.payload) {
          state.selectedBooking = null;
        }
      });
  },
});

export const { clearError, setSelectedBooking } = bookingSlice.actions;
export default bookingSlice.reducer; 