import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../store/slices/productSlice';

const TestRedux = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);

  console.log('TestRedux - products:', products, 'loading:', loading, 'error:', error);
  console.log('TestRedux - auth:', { user, isAuthenticated, authLoading });

  const handleTestFetch = () => {
    console.log('Testing product fetch...');
    dispatch(fetchAllProducts());
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Redux Test Component</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold">Auth State:</h3>
        <p>Loading: {authLoading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'None'}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Products State:</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error || 'None'}</p>
        <p>Products Count: {products?.length || 0}</p>
        <button 
          onClick={handleTestFetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Fetch Products
        </button>
      </div>

      {products && products.length > 0 && (
        <div>
          <h3 className="font-semibold">Products:</h3>
          <ul className="list-disc list-inside">
            {products.slice(0, 3).map(product => (
              <li key={product.id}>{product.name} - ${product.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestRedux; 