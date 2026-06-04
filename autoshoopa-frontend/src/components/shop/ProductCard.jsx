import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../config';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();

  // Ensure product has all required properties with defaults
  const {
    id = product?._id || '',
    name = 'Unnamed Product',
    price = 0,
    images = [],
    stock = 0,
    brand = 'Unknown Brand',
    category = 'uncategorized',
    description = 'No description available'
  } = product || {};

  const handleAddToCart = async () => {
    if (stock === 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      setIsAddingToCart(true);
      const cartItem = {
        id,
        name,
        price,
        image: product.image_url || images[0] || '/placeholder-image.jpg',
        quantity: 1,
        stock,
        brand,
        category
      };
      
      await addToCart(cartItem);
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/product/${id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImageUrl(product.image_url || images[0])}
            alt={name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {stock <= 5 && stock > 0 && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              Only {stock} left
            </div>
          )}
          {stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              Out of Stock
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2 hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-blue-600">
            ${price.toFixed(2)}
          </span>
          <button
            className="text-light-textMuted dark:text-dark-textMuted hover:text-red-500 transition-colors"
            aria-label="Add to wishlist"
          >
            <FaHeart />
          </button>
        </div>
        
        <p className="text-light-textSecondary dark:text-dark-textSecondary text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
            stock === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : isAddingToCart
              ? 'bg-blue-400 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <FaShoppingCart />
          {isAddingToCart ? 'Adding...' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 