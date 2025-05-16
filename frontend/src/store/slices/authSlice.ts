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
    localStorage.setItem('token', data.token);
    return data;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

export const validateToken = createAsyncThunk<
  AuthResponse,
  void,
  {
    rejectWithValue: string;
    state: RootState;
  }
>('auth/validateToken', async (_, { rejectWithValue, getState }) => {
  const tokenFromState = getState().auth.token;
  if (!tokenFromState) {
    return rejectWithValue('No token found in state for validation');
  }

  try {
    const { data } = await api.get<{ message: string, user: User }>('/auth/validate');
    return {
      token: tokenFromState,
      user: data.user
    };
  } catch (error) {
    console.warn('validateToken failed, but token is kept for now:', error);
    return rejectWithValue('Invalid token on backend validation');
  }
});

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
        if (action.payload.token !== state.token) {
            state.token = action.payload.token;
            localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload as string || 'Token validation failed';
        console.warn('validateToken.rejected: User set to not authenticated, token kept.');
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer; 