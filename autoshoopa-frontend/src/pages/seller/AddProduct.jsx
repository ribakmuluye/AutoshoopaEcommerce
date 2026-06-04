import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct } from '../../store/slices/productSlice';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    specifications: '',
    features: ''
  });

  const categories = [
    { value: 'engine', label: 'Engine Parts' },
    { value: 'brakes', label: 'Brake System' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'body', label: 'Body Parts' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'tires_wheels', label: 'Tires and Wheels' },
    { value: 'interior', label: 'Interior' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Upload a single image File to the backend and return the stored URL.
   * Falls back to a category placeholder if the upload fails.
   */
  const uploadImage = async (imageFile) => {
    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('image', imageFile);

      const response = await fetch(
        'http://localhost/Autoshoopa_website/autoshoopa-backend/api/upload.php',
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body,
        }
      );

      const data = await response.json();
      if (response.ok && data.url) {
        return data.url; // relative path, e.g. /uploads/products/product_xyz.jpg
      }
      throw new Error(data.error || 'Upload failed');
    } catch (err) {
      console.error('Image upload error:', err);
      // Fallback to category-based Unsplash image if upload fails
      const categoryImages = {
        engine:      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        brakes:      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        suspension:  'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
        electrical:  'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=800&q=80',
        body:        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
        accessories: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80',
        interior:    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      };
      return categoryImages[formData.category?.toLowerCase()] ||
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add products');
      return;
    }

    try {
      setLoading(true);
      
      // Upload the first selected image (or use fallback placeholder)
      const primaryImage = images.length > 0
        ? await uploadImage(images[0])
        : 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
      
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        brand: formData.brand,
        image_url: primaryImage,
        seller_id: user.id || user.uid,
        seller_name: user.name || user.displayName,
        status: 'active',
        rating: 0,
        review_count: 0
      };

      const result = await dispatch(createProduct(productData)).unwrap();
      
      if (result) {
        toast.success('Product added successfully!');
        navigate('/seller/products');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-surfaceAlt dark:bg-dark-surfaceAlt py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">Add New Product</h2>
      
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary mb-2">
                  Product Images (Max 5)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-light-borderHover dark:border-dark-borderHover border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-light-textMuted dark:text-dark-textMuted" />
                    <div className="flex text-sm text-light-textSecondary dark:text-dark-textSecondary">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white dark:bg-dark-surface rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload images</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-light-textMuted dark:text-dark-textMuted">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                    Price (ETB)
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    id="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category and Brand */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    required
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label htmlFor="specifications" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  Specifications (One per line)
                </label>
                <textarea
                  name="specifications"
                  id="specifications"
                  rows={4}
                  value={formData.specifications}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Material: Steel&#10;Weight: 2kg&#10;Dimensions: 10x5x3cm"
                />
              </div>

              {/* Features */}
              <div>
                <label htmlFor="features" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  Features (One per line)
                </label>
                <textarea
                  name="features"
                  id="features"
                  rows={4}
                  value={formData.features}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-light-borderHover dark:border-dark-borderHover rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., High-quality material&#10;Easy to install&#10;Durable construction"
                />
              </div>

              {/* Submit Button */}
              <div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Adding Product...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;