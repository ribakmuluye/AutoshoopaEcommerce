import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { toast } from 'react-toastify';

// Load auth state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) {
      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        pendingSellers: [],
        allSellers: [],
        allCustomers: [],
        allProducts: [],
        allOrders: [],
        allUsers: []
      };
    }
    const state = JSON.parse(serializedState);
    
    // Ensure token is stored separately for existing sessions
    if (state.user && state.user.token && !localStorage.getItem('token')) {
      localStorage.setItem('token', state.user.token);
    }
    
    return state;
  } catch (err) {
    console.error('Error loading auth state from localStorage:', err);
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      pendingSellers: [],
      allSellers: [],
      allCustomers: [],
      allProducts: [],
      allOrders: [],
      allUsers: []
    };
  }
};

// Save auth state to localStorage
const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('auth', serializedState);
    if (state.user && state.user.token) {
      localStorage.setItem('token', state.user.token);
    }
  } catch (err) {
    console.error('Error saving auth state to localStorage:', err);
  }
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName, userType = 'customer', business_name = '', business_address = '', phone = '' }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/register.php', {
        name: displayName,
        email,
        password,
        user_type: userType,
        business_name,
        business_address,
        phone
      });
      toast.success('Registration successful!');
      return response.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      const msg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login.php', { email, password });
      toast.success('Login successful!');
      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get pending sellers
export const getPendingSellers = createAsyncThunk(
  'auth/getPendingSellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users.php');
      const users = Array.isArray(response.data) ? response.data : [];
      return users.filter(user => 
        (user.user_type === 'seller' || user.role === 'seller') && 
        (user.status === 'pending' || !user.status)
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all sellers
export const getAllSellers = createAsyncThunk(
  'auth/getAllSellers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users.php');
      const users = Array.isArray(response.data) ? response.data : [];
      return users.filter(user => user.user_type === 'seller' || user.role === 'seller');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all customers
export const getAllCustomers = createAsyncThunk(
  'auth/getAllCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users.php');
      const users = Array.isArray(response.data) ? response.data : [];
      return users.filter(user => user.user_type === 'customer' || user.role === 'customer' || (!user.user_type && !user.role));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all products
export const getAllProducts = createAsyncThunk(
  'auth/getAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/products.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all orders
export const getAllOrders = createAsyncThunk(
  'auth/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orders.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all users
export const getAllUsers = createAsyncThunk(
  'auth/getAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Approve seller
export const approveSeller = createAsyncThunk(
  'auth/approveSeller',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/api/users.php?id=${userId}`, { status: 'approved' });
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reject seller
export const rejectSeller = createAsyncThunk(
  'auth/rejectSeller',
  async (userId, { rejectWithValue }) => {
    try {
      await api.put(`/api/users.php?id=${userId}`, { status: 'rejected' });
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  'auth/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      await api.put(`/api/users.php?id=${userId}`, { status });
      return { userId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users.php?id=${userId}`, userData);
      return { userId, userData: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create admin account
export const createAdminAccount = createAsyncThunk(
  'auth/createAdminAccount',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/register.php', {
        name: displayName,
        email,
        password,
        user_type: 'admin'
      });
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        saveAuthState(state);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        saveAuthState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.pendingSellers = [];
        state.allSellers = [];
        state.allCustomers = [];
        state.allProducts = [];
        state.allOrders = [];
        state.allUsers = [];
        saveAuthState(state);
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get pending sellers
      .addCase(getPendingSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingSellers = action.payload;
      })
      .addCase(getPendingSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all sellers
      .addCase(getAllSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.allSellers = action.payload;
      })
      .addCase(getAllSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all customers
      .addCase(getAllCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.allCustomers = action.payload;
      })
      .addCase(getAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.allProducts = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.allUsers = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve seller
      .addCase(approveSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveSeller.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload;
        if (state.pendingSellers) {
          state.pendingSellers = state.pendingSellers.filter(user => user.id !== userId);
        }
        if (state.allSellers) {
          state.allSellers = state.allSellers.map(user => 
            user.id === userId ? { ...user, status: 'approved' } : user
          );
        }
      })
      .addCase(approveSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject seller
      .addCase(rejectSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectSeller.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload;
        if (state.pendingSellers) {
          state.pendingSellers = state.pendingSellers.filter(user => user.id !== userId);
        }
        if (state.allSellers) {
          state.allSellers = state.allSellers.map(user => 
            user.id === userId ? { ...user, status: 'rejected' } : user
          );
        }
      })
      .addCase(rejectSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, userData } = action.payload;
        if (state.allUsers) {
          state.allUsers = state.allUsers.map(user => 
            user.id === userId ? { ...user, ...userData } : user
          );
        }
        if (state.allSellers) {
          state.allSellers = state.allSellers.map(user => 
            user.id === userId ? { ...user, ...userData } : user
          );
        }
        if (state.allCustomers) {
          state.allCustomers = state.allCustomers.map(user => 
            user.id === userId ? { ...user, ...userData } : user
          );
        }
        if (state.user && state.user.id === userId) {
          state.user = { ...state.user, ...userData };
          saveAuthState(state);
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create admin account
      .addCase(createAdminAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdminAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        saveAuthState(state);
      })
      .addCase(createAdminAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, status } = action.payload;
        if (state.allUsers) {
          state.allUsers = state.allUsers.map(user => 
            user.id === userId ? { ...user, status } : user
          );
        }
        if (state.allSellers) {
          state.allSellers = state.allSellers.map(user => 
            user.id === userId ? { ...user, status } : user
          );
        }
        if (state.allCustomers) {
          state.allCustomers = state.allCustomers.map(user => 
            user.id === userId ? { ...user, status } : user
          );
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;