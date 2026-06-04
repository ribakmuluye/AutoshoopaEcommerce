import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/products/ProductCard';
import { toast } from 'react-toastify';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products: allProducts, loading } = useSelector((state) => state.products);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  // Fetch products from API via Redux
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Apply filters whenever allProducts or filters change
  useEffect(() => {
    let filteredProducts = [...(allProducts || [])];

    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(
        product => product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        filteredProducts.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        break;
    }

    setProducts(filteredProducts);
  }, [allProducts, filters]);

  // Update URL when filters change
  useEffect(() => {
    setSearchParams(filters);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="border rounded p-2"
          >
            <option value="">All Categories</option>
            <option value="engine">Engine Parts</option>
            <option value="brakes">Brakes</option>
            <option value="suspension">Suspension</option>
            <option value="electrical">Electrical</option>
            <option value="body">Body Parts</option>
            <option value="interior">Interior</option>
            <option value="accessories">Accessories</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="border rounded p-2"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="border rounded p-2"
          />

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border rounded p-2"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-xl text-gray-600">No products found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;