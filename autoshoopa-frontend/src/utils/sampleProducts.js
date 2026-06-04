import api from '../api/client';

const sampleProducts = [
  {
    name: 'High Performance Air Filter',
    description: 'Premium air filter for improved engine performance and fuel efficiency.',
    price: 49.99,
    category: 'engine',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1635784065923-b0b5b7498e14?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1635784065923-b0b5b7498e14?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.5,
    review_count: 12,
    total_sales: 25
  },
  {
    name: 'Ceramic Brake Pads',
    description: 'Long-lasting ceramic brake pads for superior stopping power and reduced dust.',
    price: 89.99,
    category: 'brakes',
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.8,
    review_count: 18,
    total_sales: 42
  },
  {
    name: 'Performance Suspension Kit',
    description: 'Complete suspension upgrade kit for improved handling and ride comfort.',
    price: 599.99,
    category: 'suspension',
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.7,
    review_count: 8,
    total_sales: 12
  },
  {
    name: 'LED Headlight Kit',
    description: 'Bright and energy-efficient LED headlight conversion kit.',
    price: 129.99,
    category: 'electrical',
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1621859169457-3e527e461575?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1621859169457-3e527e461575?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.6,
    review_count: 15,
    total_sales: 35
  },
  {
    name: 'Carbon Fiber Hood',
    description: 'Lightweight carbon fiber hood for improved aerodynamics and style.',
    price: 799.99,
    category: 'body',
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1611016186353-652aaf2cb93c?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1611016186353-652aaf2cb93c?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.9,
    review_count: 6,
    total_sales: 8
  },
  {
    name: 'Leather Seat Covers',
    description: 'Premium leather seat covers for enhanced comfort and style.',
    price: 299.99,
    category: 'interior',
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.4,
    review_count: 20,
    total_sales: 45
  },
  {
    name: 'Car Phone Mount',
    description: 'Universal phone mount for safe and convenient device access while driving.',
    price: 24.99,
    category: 'accessories',
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=400&q=80',
    images: ['https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=400&q=80'],
    is_approved: true,
    status: 'active',
    rating: 4.3,
    review_count: 30,
    total_sales: 75
  }
];

export const addSampleProducts = async () => {
  try {
    for (const product of sampleProducts) {
      await api.post('/api/products.php', {
        ...product,
        image_url: product.image_url || (product.images && product.images[0]) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    console.log('Sample products added successfully');
    return true;
  } catch (error) {
    console.error('Error adding sample products:', error);
    return false;
  }
};

export default sampleProducts;