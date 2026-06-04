import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';
import toast from 'react-hot-toast';

// Helper to convert timestamps if needed – now handled by backend
const convertTimestamp = (data) => data;

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/products.php');
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return rejectWithValue('Failed to fetch products: ' + error.message);
    }
  }
);

// Fetch seller products
export const fetchSellerProducts = createAsyncThunk(
  'products/fetchSellerProducts',
  async (sellerId, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/products.php', { params: { sellerId } });
      return data;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      return rejectWithValue('Failed to fetch seller products');
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/products.php', productData);
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return rejectWithValue('Failed to create product');
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/products.php?id=${productId}`, productData);
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      return rejectWithValue('Failed to update product');
    }
  }
);

// Delete product (soft‑delete)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/api/products.php?id=${productId}`);
      return productId;
    } catch (error) {
      console.error('Error deleting product:', error);
      return rejectWithValue('Failed to delete product');
    }
  }
);

// Update product stock
export const updateProductStock = createAsyncThunk(
  'products/updateProductStock',
  async ({ productId, newStock, reason = 'manual_update' }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/api/products.php?id=${productId}`, { stock: newStock, reason });
      return { productId, newStock };
    } catch (error) {
      console.error('Error updating product stock:', error);
      return rejectWithValue('Failed to update product stock');
    }
  }
);

// Low stock and inventory summary can be fetched via dedicated endpoints later.

const initialState = {
  products: [],
  sellerProducts: [],
  selectedProduct: null,
  loading: false,
  error: null,
  categories: [
    'engine',
    'brakes',
    'suspension',
    'electrical',
    'body',
    'interior',
    'accessories'
  ]
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setSelectedProduct: (state, action) => { state.selectedProduct = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload; })
      .addCase(fetchAllProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchSellerProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => { state.loading = false; state.sellerProducts = action.payload; })
      .addCase(fetchSellerProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => { state.loading = false; state.products.push(action.payload); state.sellerProducts.push(action.payload); })
      .addCase(createProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.map(p => p.id === action.payload.id ? action.payload : p);
        state.sellerProducts = state.sellerProducts.map(p => p.id === action.payload.id ? action.payload : p);
      })
      .addCase(updateProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteProduct.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        state.sellerProducts = state.sellerProducts.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const { productId, newStock } = action.payload;
        state.products = state.products.map(p => p.id === productId ? { ...p, stock: newStock } : p);
        state.sellerProducts = state.sellerProducts.map(p => p.id === productId ? { ...p, stock: newStock } : p);
      });
  }
});

export const { clearError, setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
