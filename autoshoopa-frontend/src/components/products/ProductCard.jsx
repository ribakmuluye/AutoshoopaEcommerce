import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../config';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const isOutOfStock = !product.stock || Number(product.stock) === 0;

  const handleAddToCart = () => {
    try {
      if (!product) {
        console.error('No product data available');
        toast.error('Unable to add product to cart');
        return;
      }

      if (!product.id) {
        console.error('Product ID is missing');
        toast.error('Invalid product data');
        return;
      }

      if (isOutOfStock) {
        toast.error('Sorry, this product is out of stock!', {
          icon: '🚫',
          style: {
            borderRadius: '10px',
            background: '#1f2937',
            color: '#fff',
          },
        });
        return;
      }

      const cartItem = {
        id: product.id,
        name: product.name || 'Unnamed Product',
        price: Number(product.price) || 0,
        image: product.image_url || product.image || '',
        category: product.category || 'Uncategorized',
        brand: product.brand || 'Unknown',
        quantity: 1
      };

      addToCart(cartItem);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-dark-surface rounded-lg shadow-md overflow-hidden relative"
    >
      <div className="relative">
        <img
          src={getImageUrl(product.image_url || product.image)}
          alt={product.name}
          className={`w-full h-48 object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/logo.svg';
          }}
        />
        <div className="absolute top-2 right-2 bg-brand-orange-500 text-white px-2 py-1 rounded-full text-sm">
          {product.category}
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-full shadow-lg">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">{product.name}</h3>
        <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-2">{product.brand}</p>
        <div className="flex items-center mb-2">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="text-light-textSecondary dark:text-dark-textSecondary">{product.rating || 4.5}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-light-text dark:text-dark-text">
            {Number(product.price).toFixed(2)} ETB
          </span>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            className={`flex items-center px-3 py-2 rounded-lg text-white transition-all ${
              isOutOfStock
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : 'bg-brand-orange-500 hover:bg-brand-orange-600 cursor-pointer'
            }`}
          >
            <FaShoppingCart className="mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;