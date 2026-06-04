import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

// Create order and update stock
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async ({ orderData, cart }, { rejectWithValue }) => {
    try {
      console.log('Creating order:', orderData);
      console.log('Cart items:', cart);

      const response = await api.post('/api/orders.php', {
        items: cart,
        shipping_address: orderData.customerInfo,
        payment_method: orderData.paymentMethod
      });

      console.log('Order created successfully:', response.data.order);
      return {
        order: response.data.order,
        payment_url: response.data.payment_url || null,
        stockUpdates: response.data.order.items
      };
    } catch (error) {
      console.error('Error creating order:', error);
      const msg = error.response?.data?.error || error.message || 'Failed to create order';
      return rejectWithValue(msg);
    }
  }
);

// Get customer orders
export const getCustomerOrders = createAsyncThunk(
  'orders/getCustomerOrders',
  async (customerId, { rejectWithValue }) => {
    try {
      console.log('getCustomerOrders - Fetching orders for customer:', customerId);
      const response = await api.get(`/api/orders.php`, { params: { customerId } });
      const orders = Array.isArray(response.data) ? response.data : [];
      console.log('getCustomerOrders - Found orders:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

// Get all orders (for admin)
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orders.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

// Get seller orders
export const getSellerOrders = createAsyncThunk(
  'orders/getSellerOrders',
  async (sellerId, { rejectWithValue }) => {
    try {
      console.log('getSellerOrders - Fetching orders for seller:', sellerId);
      const response = await api.get(`/api/orders.php`, { params: { sellerId } });
      const orders = Array.isArray(response.data) ? response.data : [];
      console.log('getSellerOrders - Found orders:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return rejectWithValue('Failed to fetch orders');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/orders.php?id=${orderId}`, { status });
      return { orderId, status: response.data.status };
    } catch (error) {
      console.error('Error updating order status:', error);
      return rejectWithValue('Failed to update order status');
    }
  }
);

const initialState = {
  orders: [],
  customerOrders: [],
  sellerOrders: [],
  loading: false,
  error: null,
  currentOrder: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
        state.customerOrders.unshift(action.payload.order);
        toast.success('Order placed successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      // Get customer orders
      .addCase(getCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrders = action.payload;
      })
      .addCase(getCustomerOrders.rejected, (state, action) => {
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
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get seller orders
      .addCase(getSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerOrders = action.payload;
      })
      .addCase(getSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, status } = action.payload;
        
        // Update order in all relevant arrays
        state.orders = state.orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
        state.customerOrders = state.customerOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
        state.sellerOrders = state.sellerOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
        
        toast.success('Order status updated successfully!');
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { clearError, setCurrentOrder, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
