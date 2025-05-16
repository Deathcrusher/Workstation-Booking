import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';
import { RootState } from '../../store';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'BAND';
  band?: {
    id: string;
    name: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginResponse {
  token: string;
  user: User;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string }
>(
  'auth/login',
  async (credentials) => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Validate the token content before storing it
    if (!data.token || !data.user || !data.user.id) {
      throw new Error('Invalid authentication response');
    }
    
    localStorage.setItem('token', data.token);
    return data;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    // No need to call an API for logout in this implementation
    return true;
  }
);

// Validate token on app startup or when needed
export const validateToken = createAsyncThunk<
  { user: User; token: string },
  void,
  { state: RootState }
>(
  'auth/validateToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const token = auth.token;
      
      if (!token) {
        return rejectWithValue('No token available');
      }
      
      const { data } = await api.get<{ user: User; message: string }>('/auth/validate-token');
      
      // Return both the user and the original token
      return { 
        user: data.user,
        token: token
      };
    } catch (error) {
      console.error('Token validation error:', error);
      // Don't throw the error - just return rejectWithValue
      // This allows the app to handle auth failures more gracefully
      return rejectWithValue('Token validation failed');
    }
  },
  {
    // Add condition to only run if we have a token
    condition: (_, { getState }) => {
      const { auth } = getState();
      return !!auth.token;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.loading = false;
        if (action.payload.token !== state.token) {
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        // Don't immediately clear auth state on first validation failure
        // This prevents immediate logout but marks auth as potentially invalid
        state.loading = false;
        console.warn('Token validation failed:', action.payload);
        
        // We'll only clear auth if explicitly told to do so
        // This prevents logout loops during temporary API issues
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer; 