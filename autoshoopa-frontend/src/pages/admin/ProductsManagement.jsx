import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts, getAllSellers } from '../../store/slices/authSlice';
import { FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import { getImageUrl } from '../../config';

const ProductsManagement = () => {
  const dispatch = useDispatch();
  const { allProducts = [], allSellers = [], loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllSellers());
  }, [dispatch]);

  const getSellerName = (sellerId) => {
    const seller = allSellers.find(s => s.uid === sellerId);
    return seller ? seller.name : 'Unknown Seller';
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      ) : allProducts.length === 0 ? (
        <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
          No products found
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
              {allProducts.map((product) => (
                <tr key={product.id} className="hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getImageUrl(product.image_url || (product.images && product.images[0]))}
                          alt={product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-light-text dark:text-dark-text">
                          {product.name}
                        </div>
                        <div className="text-sm text-light-textMuted dark:text-dark-textMuted">
                          {product.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    ${formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    {product.stock || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    {product.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    {getSellerName(product.seller_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement; 