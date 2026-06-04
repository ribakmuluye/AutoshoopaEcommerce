import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTimes, FaSearch, FaStar, FaCheck, FaSlidersH, FaSortAmountDown, FaThLarge, FaThList } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts } from '../../store/slices/productSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../config';

const Shop = () => {
  const dispatch = useDispatch();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState('newest');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    try {
      dispatch(fetchAllProducts());
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  }, [dispatch]);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const searchFromUrl = searchParams.get('search');
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
    if (searchFromUrl) setSearchQuery(searchFromUrl);
  }, [searchParams]);

  const categories = [
    { value: 'all', label: 'All Spares' },
    { value: 'engine', label: 'Engine Parts' },
    { value: 'brakes', label: 'Brake System' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'body', label: 'Body Parts' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'tires_wheels', label: 'Tires & Wheels' },
    { value: 'interior', label: 'Interior' }
  ];

  const handleAddToCart = (product) => {
    const isOutOfStock = !product.stock || Number(product.stock) === 0;
    if (isOutOfStock) {
      toast.error('Sorry, this product is out of stock!', { icon: '🚫' });
      return;
    }
    try {
      addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const targetCat = categories.find(c => c.value === selectedCategory);
    const matchesCategory = selectedCategory === 'all' || (
      product.category && targetCat && (
        product.category.toLowerCase() === targetCat.value.toLowerCase() ||
        product.category.toLowerCase() === targetCat.label.toLowerCase() ||
        targetCat.label.toLowerCase().includes(product.category.toLowerCase())
      )
    );
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      default: return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg pt-10 transition-colors duration-300">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-light-border dark:border-dark-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-orange-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-xs text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider">Loading spares catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-8 pb-16">
      
      {/* Light Minimalist Header */}
      <div className="relative overflow-hidden border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface py-12 px-6 transition-colors duration-300">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-400 uppercase tracking-widest bg-brand-orange-50 dark:bg-brand-orange-950/20 px-2.5 py-1 rounded-full border border-brand-orange-100 dark:border-brand-orange-500/20">Browse Catalog</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            Genuine Auto Spares & Parts
          </h1>
          <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-lg mx-auto leading-relaxed">
            Source high-grade engine parts, brakes, suspension, and body components from verified local dealers.
          </p>

          {/* Minimal Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto pt-2">
            <div className="relative flex items-center bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border p-1.5 rounded-2xl focus-within:border-brand-orange-500 focus-within:ring-2 focus-within:ring-brand-orange-500/10 transition-all duration-200">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-3.5 w-3.5 text-light-textMuted dark:text-dark-textMuted" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search filters, brakes, spark plugs..."
                className="w-full pl-10 pr-24 py-2.5 bg-transparent border-0 text-light-text dark:text-dark-text placeholder-light-textMuted dark:placeholder-dark-textMuted focus:outline-none focus:ring-0 text-xs font-medium"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-white text-[10px] font-bold transition-all bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Categories Horizontal Selector */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          <div className="flex gap-2 min-w-max">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'text-white border-transparent'
                    : 'bg-white dark:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary border-light-border dark:border-dark-border hover:border-light-borderHover dark:hover:border-dark-borderHover'
                }`}
                style={selectedCategory === cat.value ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 12px rgba(249,115,22,0.2)' } : {}}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-light-border dark:border-dark-border pb-5">
          <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider">
            Found <span className="text-light-text dark:text-dark-text font-extrabold">{sortedProducts.length}</span> parts listed
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary focus:outline-none focus:border-brand-orange-500 cursor-pointer"
              >
                <option value="newest">Newest Spares</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <FaSortAmountDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-light-textMuted dark:text-dark-textMuted pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showFilters 
                  ? 'bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-400 border-brand-orange-200 dark:border-brand-orange-500/20' 
                  : 'bg-white dark:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary border-light-border dark:border-dark-border hover:border-light-borderHover dark:hover:border-dark-borderHover'
              }`}
            >
              <FaSlidersH className="w-3 h-3" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt/50 text-brand-orange-500 dark:text-brand-orange-400' : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:hover:text-dark-textSecondary'}`}
              >
                <FaThLarge className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt/50 text-brand-orange-500 dark:text-brand-orange-400' : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:hover:text-dark-textSecondary'}`}
              >
                <FaThList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Price Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider">Price Range (ETB)</h3>
                  <button onClick={() => setPriceRange({ min: 0, max: 1000000 })} className="text-[10px] text-brand-orange-600 dark:text-brand-orange-400 font-bold hover:underline cursor-pointer">
                    Reset Filter
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-textMuted dark:text-dark-textMuted text-xs font-bold">Min</span>
                    <input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full pl-12 pr-3 py-2.5 bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-text dark:text-dark-text focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                  <span className="text-light-border dark:text-dark-border font-semibold">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-textMuted dark:text-dark-textMuted text-xs font-bold">Max</span>
                    <input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full pl-12 pr-3 py-2.5 bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-text dark:text-dark-text focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Display Container */}
        {sortedProducts.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'flex flex-col gap-4'
          }>
            {sortedProducts.map((product) => {
              const isOutOfStock = !product?.stock || Number(product?.stock) === 0;
              const inCart = isInCart(product.id);

              // List view implementation
              if (viewMode === 'list') {
                return (
                  <motion.div
                    key={product?.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <Link to={`/products/${product?.id}`} className="relative w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 bg-light-surfaceAlt dark:bg-dark-surfaceAlt/60 flex items-center justify-center p-4">
                        <img
                          src={getImageUrl(product?.image_url || product?.images?.[0])}
                          alt={product?.name}
                          className={`w-full h-full object-contain ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                          onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.svg'; }}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">OUT OF STOCK</span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <Link to={`/products/${product?.id}`}>
                            <h3 className="text-base font-extrabold text-light-text dark:text-dark-text hover:text-brand-orange-500 dark:hover:text-brand-orange-400 transition-colors">{product?.name}</h3>
                          </Link>
                          <p className="text-light-textSecondary dark:text-dark-textSecondary text-xs font-medium leading-relaxed line-clamp-2">{product?.description}</p>
                          <div className="flex items-center gap-3 pt-1">
                            {product?.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <FaStar className="text-yellow-400 w-3 h-3" />
                                <span className="text-xs font-bold text-light-text dark:text-dark-text">{Number(product.rating).toFixed(1)}</span>
                              </div>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isOutOfStock ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'}`}>
                              {isOutOfStock ? 'Out of stock' : `${product?.stock} in stock`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-light-border dark:border-dark-border">
                          <div>
                            <span className="text-lg font-extrabold text-light-text dark:text-dark-text">{Number(product?.price || 0).toFixed(2)}</span>
                            <span className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold ml-1">ETB</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                              isOutOfStock ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textMuted dark:text-dark-textMuted border border-light-border dark:border-dark-border cursor-not-allowed' : inCart ? 'bg-green-600 hover:bg-green-700' : ''
                            }`}
                            style={!isOutOfStock && !inCart ? { background: 'linear-gradient(135deg, #f97316, #ea580c)' } : {}}
                          >
                            {isOutOfStock ? (<><FaTimes /> Sold Out</>) 
                              : inCart ? (<><FaCheck /> In Cart ({getItemQuantity(product.id)})</>) 
                              : (<><FaShoppingCart /> Add to Cart</>)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Grid view implementation
              return (
                <motion.div
                  key={product?.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                >
                  <Link to={`/products/${product?.id}`} className="block relative bg-light-surfaceAlt dark:bg-dark-surfaceAlt/60 flex items-center justify-center p-6 h-48">
                    <img
                      src={getImageUrl(product?.image_url || product?.images?.[0])}
                      alt={product?.name || 'Product'}
                      className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.svg'; }}
                    />
                    
                    {/* Badges overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product?.discount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          -{product.discount}%
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>
                    {product?.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-dark-surface/90 border border-light-border dark:border-dark-border px-2 py-0.5 rounded-md flex items-center gap-1">
                        <FaStar className="text-yellow-400 w-2.5 h-2.5" />
                        <span className="text-[10px] font-bold text-light-text dark:text-dark-text">{Number(product.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4.5 space-y-3.5">
                    <div className="space-y-1">
                      <Link to={`/products/${product?.id}`}>
                        <h3 className="font-extrabold text-light-text dark:text-dark-text text-sm line-clamp-1 group-hover:text-brand-orange-500 dark:group-hover:text-brand-orange-400 transition-colors">
                          {product?.name || 'Unnamed Spare'}
                        </h3>
                      </Link>
                      <p className="text-light-textMuted dark:text-dark-textMuted text-[10px] font-medium line-clamp-1">
                        {product?.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-light-border dark:border-dark-border pt-3">
                      <div>
                        <span className="text-base font-extrabold text-light-text dark:text-dark-text">
                          {Number(product?.price || 0).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-light-textMuted dark:text-dark-textMuted font-bold ml-1">ETB</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isOutOfStock ? 'bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/30' : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                      }`}>
                        {isOutOfStock ? 'Sold out' : `${product?.stock} left`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isOutOfStock
                          ? 'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textMuted dark:text-dark-textMuted border border-light-border dark:border-dark-border cursor-not-allowed'
                          : inCart
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 hover:bg-green-100 dark:hover:bg-green-900/20'
                            : 'text-white hover:opacity-90'
                      }`}
                      style={!isOutOfStock && !inCart ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 2px 8px rgba(249,115,22,0.2)' } : {}}
                    >
                      {isOutOfStock ? (
                        <><FaTimes /> Sold Out</>
                      ) : inCart ? (
                        <><FaCheck /> In Cart ({getItemQuantity(product.id)})</>
                      ) : (
                        <><FaShoppingCart /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8">
            <div className="w-16 h-16 bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl flex items-center justify-center mb-5 text-light-textMuted dark:text-dark-textMuted">
              <FaSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-1">No spares found</h3>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted mb-6 max-w-sm">
              We couldn't find any products matching your active filters. Try refining your parameters.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); searchParams.delete('category'); searchParams.delete('search'); setSearchParams(searchParams); }}
              className="px-6 py-3 rounded-xl text-white font-bold text-xs shadow-md shadow-brand-orange-500/10 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;