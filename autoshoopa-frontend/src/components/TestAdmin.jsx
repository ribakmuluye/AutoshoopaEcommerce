import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct } from '../store/slices/productSlice';
import { register } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const TestAdmin = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, pendingSellers, allSellers, allCustomers } = useSelector((state) => state.auth);

  const createTestSeller = async () => {
    try {
      const timestamp = Date.now();
      await dispatch(register({
        email: `seller${timestamp}@test.com`,
        password: 'password123',
        displayName: `Test Seller ${timestamp}`,
        userType: 'seller',
      })).unwrap();
      toast.success('Test seller created successfully!');
    } catch (error) {
      console.error('Error creating test seller:', error);
      toast.error('Failed to create test seller');
    }
  };

  const createTestCustomer = async () => {
    try {
      const timestamp = Date.now();
      await dispatch(register({
        email: `customer${timestamp}@test.com`,
        password: 'password123',
        displayName: `Test Customer ${timestamp}`,
        userType: 'customer',
      })).unwrap();
      toast.success('Test customer created successfully!');
    } catch (error) {
      console.error('Error creating test customer:', error);
      toast.error('Failed to create test customer');
    }
  };

  const createAndLoginAsSeller = async () => {
    try {
      const timestamp = Date.now();
      await dispatch(register({
        email: `seller${timestamp}@test.com`,
        password: 'password123',
        displayName: `Test Seller ${timestamp}`,
        userType: 'seller',
      })).unwrap();
      toast.success('Test seller created! You can now access /seller/dashboard');
    } catch (error) {
      console.error('Error creating and logging in as seller:', error);
      toast.error('Failed to create test seller');
    }
  };

  const createTestProducts = async () => {
    try {
      const testProducts = [
        {
          name: 'High Performance Air Filter',
          description: 'Premium air filter for improved engine performance and fuel efficiency. Compatible with most modern vehicles.',
          price: 45.99,
          category: 'engine',
          brand: 'AutoPro',
          stock: 50,
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
          specifications: 'Material: Cotton, Size: Universal, Flow Rate: 300 CFM',
          features: 'High flow design, Washable and reusable, Easy installation'
        },
        {
          name: 'Ceramic Brake Pads',
          description: 'Advanced ceramic brake pads offering superior stopping power and reduced brake dust.',
          price: 89.99,
          category: 'brakes',
          brand: 'BrakeTech',
          stock: 30,
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
          specifications: 'Material: Ceramic, Thickness: 12mm',
          features: 'Low dust, Quiet operation, Long lifespan'
        },
        {
          name: 'LED Headlight Bulbs',
          description: 'Bright LED headlight bulbs with 6000K cool white light.',
          price: 79.99,
          category: 'electrical',
          brand: 'LightMax',
          stock: 100,
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
          specifications: 'Power: 60W, Luminosity: 8000 lumens',
          features: 'Energy efficient, Long lifespan'
        },
      ];

      for (const product of testProducts) {
        try {
          await dispatch(createProduct({
            ...product,
            seller_id: user?.id || 'test-seller',
            seller_name: user?.name || 'Test Seller',
            is_approved: true,
            status: 'active',
            rating: Math.floor(Math.random() * 5) + 1,
            review_count: Math.floor(Math.random() * 50),
            total_sales: Math.floor(Math.random() * 100)
          })).unwrap();
        } catch (error) {
          console.error('Error creating product:', product.name, error);
        }
      }

      toast.success('Test products created successfully! Check the shop page.');
    } catch (error) {
      console.error('Error creating test products:', error);
      toast.error('Failed to create test products');
    }
  };

  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Admin Test Panel</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current User:</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify({ user, isAuthenticated }, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Data Counts:</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-100 p-3 rounded">
            <div className="text-2xl font-bold text-blue-600">{pendingSellers?.length || 0}</div>
            <div className="text-sm text-gray-600">Pending Sellers</div>
          </div>
          <div className="bg-green-100 p-3 rounded">
            <div className="text-2xl font-bold text-green-600">{allSellers?.length || 0}</div>
            <div className="text-sm text-gray-600">All Sellers</div>
          </div>
          <div className="bg-purple-100 p-3 rounded">
            <div className="text-2xl font-bold text-purple-600">{allCustomers?.length || 0}</div>
            <div className="text-sm text-gray-600">All Customers</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Test Actions:</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={createTestSeller} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Create Test Seller
          </button>
          <button onClick={createTestCustomer} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create Test Customer
          </button>
          <button onClick={createAndLoginAsSeller} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Create and Login as Test Seller
          </button>
          <button onClick={createTestProducts} className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">
            Create Test Products
          </button>
          <button onClick={refreshData} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Quick Navigation:</h3>
        <div className="flex gap-2 flex-wrap">
          <a href="/admin/dashboard" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Admin Dashboard</a>
          <a href="/seller/dashboard" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">Seller Dashboard</a>
          <a href="/products" className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600">Shop Page</a>
        </div>
      </div>

      {pendingSellers && pendingSellers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Pending Sellers:</h3>
          <div className="space-y-2">
            {pendingSellers.map((seller) => (
              <div key={seller.id} className="bg-yellow-50 p-3 rounded border">
                <div className="font-medium">{seller.name || seller.displayName || seller.email}</div>
                <div className="text-sm text-gray-600">Email: {seller.email}</div>
                <div className="text-sm text-gray-600">Status: {seller.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allSellers && allSellers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">All Sellers:</h3>
          <div className="space-y-2">
            {allSellers.map((seller) => (
              <div key={seller.id} className="bg-blue-50 p-3 rounded border">
                <div className="font-medium">{seller.name || seller.displayName || seller.email}</div>
                <div className="text-sm text-gray-600">Email: {seller.email}</div>
                <div className="text-sm text-gray-600">Status: {seller.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allCustomers && allCustomers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">All Customers:</h3>
          <div className="space-y-2">
            {allCustomers.map((customer) => (
              <div key={customer.id} className="bg-green-50 p-3 rounded border">
                <div className="font-medium">{customer.name || customer.displayName || customer.email}</div>
                <div className="text-sm text-gray-600">Email: {customer.email}</div>
                <div className="text-sm text-gray-600">Status: {customer.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAdmin;