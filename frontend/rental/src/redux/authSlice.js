import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to handle login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:3020/user/login', credentials);
      // Save token to localStorage (optional)
      localStorage.setItem('token', response.data.token);  // Save token as 'Bearer <token>'
      return response.data.token;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

// Async thunk to fetch user account details
export const fetchUserAccount = createAsyncThunk(
    'auth/fetchUserAccount',
    async (_, { getState, rejectWithValue }) => {
      const state = getState();
      const token = state.auth.token; // Make sure token is valid here
  
      if (!token) {
        return rejectWithValue("No token found"); // If no token, reject with appropriate error
      }
  
      try {
        const response = await axios.get('http://localhost:3020/user/account', {
          headers: {
            Authorization: `Bearer ${token}`, // Correct token format
          },
        });
        return response.data; // Return user account data
      } catch (error) {
        return rejectWithValue(error.response ? error.response.data : error.message);
      }
    }
  );
  

const initialState = {
  token: localStorage.getItem('token') || null,
  user: null, // Store user account data
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null; // Clear user data on logout
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login actions
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchUserAccount actions
      .addCase(fetchUserAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Store user data in the state
        state.error = null;
      })
      .addCase(fetchUserAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
