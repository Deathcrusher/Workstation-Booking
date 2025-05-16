import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface Band {
  id: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
  users: Array<{
    id: string;
    email: string;
  }>;
  rooms: Array<{
    id: string;
    name: string;
  }>;
}

interface BandState {
  bands: Band[];
  selectedBand: Band | null;
  loading: boolean;
  error: string | null;
}

const initialState: BandState = {
  bands: [],
  selectedBand: null,
  loading: false,
  error: null,
};

export const fetchBands = createAsyncThunk<Band[]>(
  'bands/fetchAll',
  async () => {
    const { data } = await api.get<Band[]>('/bands');
    return data;
  }
);

export const fetchBand = createAsyncThunk<Band, string>(
  'bands/fetchOne',
  async (id) => {
    const { data } = await api.get<Band>(`/bands/${id}`);
    return data;
  }
);

export const createBand = createAsyncThunk<Band, { name: string; contactEmail: string }>(
  'bands/create',
  async (bandData) => {
    const { data } = await api.post<Band>('/bands', bandData);
    return data;
  }
);

export const updateBand = createAsyncThunk<Band, { id: string; data: Partial<Band> }>(
  'bands/update',
  async ({ id, data }) => {
    const { data: responseData } = await api.put<Band>(`/bands/${id}`, data);
    return responseData;
  }
);

export const deleteBand = createAsyncThunk<string, string>(
  'bands/delete',
  async (id) => {
    await api.delete(`/bands/${id}`);
    return id;
  }
);

const bandSlice = createSlice({
  name: 'bands',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedBand: (state, action) => {
      state.selectedBand = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bands
      .addCase(fetchBands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBands.fulfilled, (state, action) => {
        state.loading = false;
        state.bands = action.payload;
      })
      .addCase(fetchBands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bands';
      })
      // Fetch single band
      .addCase(fetchBand.fulfilled, (state, action) => {
        state.selectedBand = action.payload;
      })
      // Create band
      .addCase(createBand.fulfilled, (state, action) => {
        state.bands.push(action.payload);
      })
      // Update band
      .addCase(updateBand.fulfilled, (state, action) => {
        const index = state.bands.findIndex((band) => band.id === action.payload.id);
        if (index !== -1) {
          state.bands[index] = action.payload;
        }
        if (state.selectedBand?.id === action.payload.id) {
          state.selectedBand = action.payload;
        }
      })
      // Delete band
      .addCase(deleteBand.fulfilled, (state, action) => {
        state.bands = state.bands.filter((band) => band.id !== action.payload);
        if (state.selectedBand?.id === action.payload) {
          state.selectedBand = null;
        }
      });
  },
});

export const { clearError, setSelectedBand } = bandSlice.actions;
export default bandSlice.reducer; 