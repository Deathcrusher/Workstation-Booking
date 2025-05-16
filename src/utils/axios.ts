import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.url, 'Token exists:', !!token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

interface ErrorResponseData {
  message?: string;
  errors?: { [key: string]: string[] };
}

interface RefreshTokenResponse {
  token: string;
}

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ErrorResponseData>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response) {
      const { status, data } = error.response;
      console.log('API Error:', status, data);

      // Only handle 401 errors for actual authentication failures
      if (status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post<RefreshTokenResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
              refreshToken,
            });
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            // Update the original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            
            processQueue();
            return api(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError);
          // Only clear tokens and redirect on actual auth failure
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(new Error('Your session has expired. Please log in again.'));
        } finally {
          isRefreshing = false;
        }
      }

      if (status === 403) {
        console.error('Permission denied:', data?.message);
        return Promise.reject(new Error('You do not have permission to perform this action.'));
      }

      if (status === 404) {
        return Promise.reject(new Error('The requested resource was not found.'));
      }

      if (status === 422) {
        // Handle validation errors
        if (data && data.errors) {
          const errorMessage = Object.entries(data.errors)
            .map(([field, messages]: [string, string[]]) => `${field}: ${messages.join(', ')}`)
            .join('\n');
          return Promise.reject(new Error(errorMessage));
        }
        return Promise.reject(new Error(data?.message || 'Validation failed'));
      }

      if (status >= 500) {
        return Promise.reject(new Error('A server error occurred. Please try again later.'));
      }

      // Handle other error responses
      const errorMessage = data?.message || error.message;
      return Promise.reject(new Error(errorMessage));
    }

    if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response from server. Please check your internet connection.'));
    }

    // Something happened in setting up the request that triggered an Error
    console.error('Request setup error:', error.message);
    return Promise.reject(new Error('An error occurred while setting up the request.'));
  }
);

export default api; 