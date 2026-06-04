// Cart service using localStorage (no Firebase)
const CART_KEY = 'autoshoopa_cart';

const getStoredCart = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    return all[userId] || [];
  } catch {
    return [];
  }
};

const saveCart = (userId, items) => {
  try {
    const all = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    all[userId] = items;
    localStorage.setItem(CART_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Error saving cart:', e);
  }
};

export const cartService = {
  // Add item to cart
  async addToCart(userId, product) {
    try {
      if (!userId) return true;
      const items = getStoredCart(userId);
      const existing = items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += (product.quantity || 1);
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image || '',
          quantity: product.quantity || 1
        });
      }
      saveCart(userId, items);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Get cart items
  async getCartItems(userId) {
    try {
      if (!userId) return [];
      return getStoredCart(userId);
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItemQuantity(userId, productId, quantity) {
    try {
      if (!userId) return true;
      const items = getStoredCart(userId).map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      saveCart(userId, items);
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(userId, productId) {
    try {
      if (!userId) return true;
      const items = getStoredCart(userId).filter(item => item.id !== productId);
      saveCart(userId, items);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart(userId) {
    try {
      if (!userId) return true;
      saveCart(userId, []);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};