import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

// Exporting the Room interface
export interface Room { 
  id: string;
  name: string;
  location: string;
  features: string;
  color: string;
  bands: Array<{
    id: string;
    name: string;
  }>;
}

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  loading: boolean;
  error: string | null;
}

const initialState: RoomState = {
  rooms: [],
  selectedRoom: null,
  loading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk<Room[]>(
  'rooms/fetchAll',
  async () => {
    const { data } = await api.get<Room[]>('/rooms');
    return data;
  }
);

export const fetchRoom = createAsyncThunk<Room, string>(
  'rooms/fetchOne',
  async (id) => {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  }
);

export const createRoom = createAsyncThunk<Room, Partial<Room>>(
  'rooms/create',
  async (roomData) => {
    const { data } = await api.post<Room>('/rooms', roomData);
    return data;
  }
);

export const updateRoom = createAsyncThunk<Room, { id: string; data: Partial<Room> }>(
  'rooms/update',
  async ({ id, data }) => {
    const { data: responseData } = await api.put<Room>(`/rooms/${id}`, data);
    return responseData;
  }
);

export const deleteRoom = createAsyncThunk<string, string>(
  'rooms/delete',
  async (id) => {
    await api.delete(`/rooms/${id}`);
    return id;
  }
);

export const assignBandsToRoom = createAsyncThunk<Room, { roomId: string; bandIds: string[] }>(
  'rooms/assignBands',
  async ({ roomId, bandIds }) => {
    const response = await api.post<Room>(`/rooms/${roomId}/assign-bands`, {
      bandIds,
    });
    return response.data;
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rooms';
      })
      // Fetch single room
      .addCase(fetchRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(fetchRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch room';
      })
      // Create room
      .addCase(createRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create room';
      })
      // Update room
      .addCase(updateRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rooms.findIndex((room) => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update room';
      })
      // Delete room
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = state.rooms.filter((room) => room.id !== action.payload);
        if (state.selectedRoom?.id === action.payload) {
          state.selectedRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete room';
      })
      // Assign bands to room
      .addCase(assignBandsToRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignBandsToRoom.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rooms.findIndex((room) => room.id === action.payload.id);
        if (index !== -1) {
          state.rooms[index] = action.payload;
        }
        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = action.payload;
        }
      })
      .addCase(assignBandsToRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to assign bands to room';
      });
  },
});

export const { clearError, setSelectedRoom } = roomSlice.actions;
export default roomSlice.reducer; 