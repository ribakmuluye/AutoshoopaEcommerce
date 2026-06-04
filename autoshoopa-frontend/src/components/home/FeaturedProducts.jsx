import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaCheck } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../../store/slices/productSlice';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../config';

const FeaturedProducts = () => {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  // Fetch products when component mounts
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Get first 4 products as featured products
  const featuredProducts = products.slice(0, 4);

  const handleAddToCart = (product) => {
    const isOutOfStock = !product.stock || Number(product.stock) === 0;
    if (isOutOfStock) {
      toast.error('Sorry, this product is out of stock!', { icon: '🚫' });
      return;
    }
    try {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text">Featured Products</h2>
            <p className="mt-4 text-base text-light-textSecondary dark:text-dark-textSecondary">
              Discover our most popular auto parts
            </p>
          </div>
          <div className="flex justify-center py-10">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-light-border dark:border-dark-border"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-orange-500 animate-spin"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            Featured Products
          </h2>
          <p className="mt-4 text-base text-light-textSecondary dark:text-dark-textSecondary max-w-lg mx-auto">
            Get 100% genuine spare parts back by AutoShoopa buyer protection
          </p>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const isOutOfStock = !product?.stock || Number(product?.stock) === 0;
              const inCart = isInCart(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm hover:shadow-xl dark:hover:border-brand-orange-500/20 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image container */}
                  <div className="relative h-48 bg-light-surfaceAlt dark:bg-dark-surfaceAlt/60 flex items-center justify-center p-4 rounded-t-2xl overflow-hidden">
                    <img
                      src={getImageUrl(product?.image_url || product?.images?.[0])}
                      alt={product.name}
                      className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ${
                        isOutOfStock ? 'opacity-50 grayscale' : ''
                      }`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                    
                    {/* Floating elements */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className="bg-brand-orange-500/10 border border-brand-orange-500/30 text-brand-orange-600 dark:text-brand-orange-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                        Genuine
                      </span>
                      {isOutOfStock && (
                        <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                    
                    <button className="absolute top-3 right-3 p-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-md hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt text-light-textMuted dark:text-dark-textMuted hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer">
                      <FaHeart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-orange-600 dark:text-brand-orange-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-light-text dark:text-dark-text group-hover:text-brand-orange-500 dark:group-hover:text-brand-orange-400 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-xs text-light-textSecondary dark:text-dark-textSecondary line-clamp-2 leading-relaxed">
                        {product.description || 'No description available for this auto spare part.'}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-lg font-extrabold text-light-text dark:text-dark-text">
                          {(Number(product.price) || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-light-textMuted dark:text-dark-textMuted ml-1 font-semibold">ETB</span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1">
                            <FaCheck className="w-2.5 h-2.5" />
                            {getItemQuantity(product.id)}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className="bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                            title="Add one more"
                          >
                            <FaShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textMuted dark:text-dark-textMuted border border-light-border dark:border-dark-border cursor-not-allowed'
                              : 'text-white bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 shadow-md shadow-brand-orange-500/10 hover:shadow-brand-orange-500/20 hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          <FaShoppingCart className="w-3.5 h-3.5" />
                          Buy
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-light-border dark:border-dark-border rounded-2xl">
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">No products available</h3>
            <p className="text-light-textMuted dark:text-dark-textMuted text-sm mt-1">Check back soon for new inventory</p>
          </div>
        )}

        <div className="text-center mt-14">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-light-border dark:border-dark-border hover:border-brand-orange-500 dark:hover:border-brand-orange-400 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 font-bold rounded-xl bg-white dark:bg-dark-surface transition-all hover:scale-[1.02] shadow-sm"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;