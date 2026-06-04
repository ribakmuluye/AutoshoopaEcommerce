import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../api/client';
import { getImageUrl } from '../../config';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const productRes = await api.get(`/api/products.php?id=${id}`);
      const productData = productRes.data;
      if (productData) {
        // Ensure images is always an array
        const images = Array.isArray(productData.images) 
          ? productData.images 
          : (productData.image_url ? [productData.image_url] : []);
        const productObj = { ...productData, images };
        setProduct(productObj);
        
        // Fetch seller information
        if (productData.seller_id) {
          const sellerRes = await api.get(`/api/users.php?id=${productData.seller_id}`);
          if (sellerRes.data) {
            setSeller(sellerRes.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = !product || !product.stock || Number(product.stock) === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Sorry, this product is out of stock!', { icon: '🚫' });
      return;
    }
    addToCart(product, quantity);
    toast.success('Added to cart successfully');
  };

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.stock, value));
    setQuantity(newQuantity);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">Product Not Found</h2>
          <Link
            to="/shop"
            className="text-brand-orange-500 hover:text-brand-orange-600 dark:text-brand-orange-400 dark:hover:text-brand-orange-300 font-bold"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="relative">
              <div className="relative h-96 rounded-lg overflow-hidden bg-light-surfaceAlt dark:bg-dark-surfaceAlt/60 flex items-center justify-center">
                {isOutOfStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                    <span className="bg-red-600 text-white font-bold text-lg px-6 py-3 rounded-full shadow-xl tracking-wide">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
                <img
                  src={getImageUrl(product.images[currentImageIndex])}
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.svg'; }}
                />
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-dark-surface/80 p-2 rounded-full hover:bg-white dark:hover:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text cursor-pointer"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-dark-surface/80 p-2 rounded-full hover:bg-white dark:hover:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text cursor-pointer"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border border-light-border dark:border-dark-border flex-shrink-0 cursor-pointer ${
                        currentImageIndex === index ? 'ring-2 ring-brand-orange-500' : ''
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">{product.name}</h1>
              
              {product.rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-light-border dark:text-dark-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-light-textSecondary dark:text-dark-textSecondary text-sm font-medium">
                    {product.rating.toFixed(1)} ({product.review_count || 0} reviews)
                  </span>
                </div>
              )}

              <div className="text-2xl font-extrabold text-light-text dark:text-dark-text mb-4">
                {(Number(product.price) || 0).toFixed(2)} <span className="text-sm font-semibold text-light-textMuted dark:text-dark-textMuted">ETB</span>
              </div>

              <p className="text-light-textSecondary dark:text-dark-textSecondary mb-6 leading-relaxed text-sm">{product.description}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-light-textSecondary dark:text-dark-textSecondary mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="px-3.5 py-1.5 border border-light-border dark:border-dark-border rounded-l-xl hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt text-light-text dark:text-dark-text bg-white dark:bg-dark-surface cursor-pointer font-bold transition-all"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                      className="w-16 text-center border-t border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none text-sm font-bold py-1.5"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="px-3.5 py-1.5 border border-light-border dark:border-dark-border rounded-r-xl hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt text-light-text dark:text-dark-text bg-white dark:bg-dark-surface cursor-pointer font-bold transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    title={isOutOfStock ? 'This product is out of stock' : 'Add to Cart'}
                    className={`flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-xl text-base font-bold text-white transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textMuted dark:text-dark-textMuted border border-light-border dark:border-dark-border cursor-not-allowed'
                        : 'bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 shadow-md shadow-brand-orange-500/20'
                    }`}
                  >
                    <FaShoppingCart className="mr-2" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button className="p-3 border border-light-border dark:border-dark-border rounded-xl hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt bg-white dark:bg-dark-surface text-light-textMuted dark:text-dark-textMuted hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer">
                    <FaHeart className="w-6 h-6" />
                  </button>
                  <button className="p-3 border border-light-border dark:border-dark-border rounded-xl hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt bg-white dark:bg-dark-surface text-light-textMuted dark:text-dark-textMuted hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors cursor-pointer">
                    <FaShare className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Seller Information */}
              {seller && (
                <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border">
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Seller Information</h3>
                  <div className="flex items-center bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 border border-light-border dark:border-dark-border p-4 rounded-xl">
                    <img
                      src={seller.photoURL || '/default-avatar.png'}
                      alt={seller.displayName}
                      className="w-12 h-12 rounded-full border border-light-border dark:border-dark-border object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                    />
                    <div className="ml-4">
                      <p className="font-bold text-light-text dark:text-dark-text">{seller.displayName}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5">{seller.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details */}
              <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border">
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Product Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 border border-light-border dark:border-dark-border p-3.5 rounded-xl">
                    <dt className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Category</dt>
                    <dd className="mt-1 text-sm font-extrabold text-light-text dark:text-dark-text">{product.category}</dd>
                  </div>
                  <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 border border-light-border dark:border-dark-border p-3.5 rounded-xl">
                    <dt className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Brand</dt>
                    <dd className="mt-1 text-sm font-extrabold text-light-text dark:text-dark-text">{product.brand || 'N/A'}</dd>
                  </div>
                  <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 border border-light-border dark:border-dark-border p-3.5 rounded-xl">
                    <dt className="text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Stock Status</dt>
                    <dd className="mt-1 text-sm font-extrabold text-light-text dark:text-dark-text">{product.stock} units left</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 