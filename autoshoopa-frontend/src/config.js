// API Configuration
export const API_BASE_URL = 'http://localhost/Autoshoopa_website/autoshoopa-backend';

// Site base URL (for uploaded assets like product images)
export const SITE_BASE_URL = 'http://localhost/Autoshoopa_website';

// Helper to resolve product image URLs (relative vs absolute)
export const getImageUrl = (url) => {
  if (!url) return '/images/logo.svg'; // fallback to frontend logo
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Normalize the path
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  // Paths starting with /uploads/ are served from the site root (NOT the backend subdirectory)
  if (cleanUrl.startsWith('/uploads/')) {
    return `${SITE_BASE_URL}${cleanUrl}`;
  }
  return `${API_BASE_URL}${cleanUrl}`;
};

// Image Upload Configuration
export const IMAGE_UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxWidth: 1920,
  maxHeight: 1080
};

// Category Icons Configuration
export const CATEGORY_ICONS = {
  cars: '🚗',
  motorcycles: '🏍️',
  trucks: '🚚',
  vans: '🚐',
  parts: '🔧',
  accessories: '🔧',
  services: '🔧',
  other: '🔧'
};

// Brand Colors Configuration
export const brandColors = {
  primary: {
    light: '#4F46E5',
    DEFAULT: '#4338CA',
    dark: '#3730A3'
  },
  secondary: {
    light: '#10B981',
    DEFAULT: '#059669',
    dark: '#047857'
  },
  accent: {
    light: '#F59E0B',
    DEFAULT: '#D97706',
    dark: '#B45309'
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// Default Configuration
export const DEFAULT_CONFIG = {
  currency: 'PHP',
  language: 'en',
  timezone: 'Asia/Manila'
}; 