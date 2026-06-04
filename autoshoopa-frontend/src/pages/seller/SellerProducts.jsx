import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { fetchSellerProducts, deleteProduct } from '../../store/slices/productSlice';
import { getImageUrl } from '../../config';
import { toast } from 'react-hot-toast';

const SellerProducts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sellerProducts: products = [], loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (user) {
      dispatch(fetchSellerProducts(user.uid));
    }
  }, [dispatch, user]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const getStatusBadgeColor = (status, isApproved) => {
    if (!isApproved) return 'bg-yellow-100 text-yellow-800';
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-text dark:text-dark-text';
    }
  };

  return (
    <div className="min-h-screen bg-light-surfaceAlt dark:bg-dark-surfaceAlt py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">My Products</h2>
          <Link
            to="/seller/products/add"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" />
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-light-textSecondary dark:text-dark-textSecondary">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-light-textSecondary dark:text-dark-textSecondary">No products found. Add your first product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-surface rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(product.status, product.is_approved)}`}>
                      {product.is_approved ? product.status : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-2">{product.name}</h3>
                  <p className="text-sm text-light-textMuted dark:text-dark-textMuted mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-light-text dark:text-dark-text">{product.price} ETB</span>
                    <span className="text-sm text-light-textMuted dark:text-dark-textMuted">Stock: {product.stock_quantity ?? product.stock ?? 0}</span>
                  </div>

                  <div className="flex justify-between space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-light-borderHover dark:border-dark-borderHover shadow-sm text-sm font-medium rounded-md text-light-textSecondary dark:text-dark-textSecondary bg-white dark:bg-dark-surface hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaEye className="mr-2" />
                      View
                    </Link>
                    <Link
                      to={`/seller/products/edit/${product.id}`}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-light-borderHover dark:border-dark-borderHover shadow-sm text-sm font-medium rounded-md text-light-textSecondary dark:text-dark-textSecondary bg-white dark:bg-dark-surface hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <FaTrash className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;
