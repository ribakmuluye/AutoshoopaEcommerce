import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('cart');
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, loading]);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    const maxStock = Number(product.stock_quantity ?? product.stock ?? 0);

    // Block entirely if out of stock
    if (maxStock === 0) {
      toast.error('This product is out of stock!', {
        icon: '🚫',
        style: { borderRadius: '10px', background: '#1f2937', color: '#fff' }
      });
      return;
    }
    
    // Check stock limit before adding
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
    if (maxStock > 0 && newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock`);
      return;
    }

    let updatedCart;

    // Ensure price is a number
    const productWithNumberPrice = {
      ...product,
      price: Number(product.price) || 0
    };

    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      updatedCart = [...cart, { ...productWithNumberPrice, quantity: newQuantity }];
    }

    setCart(updatedCart);
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = async (productId) => {
    try {
      setIsUpdating(true);
      const product = cart.find(item => item.id === productId);
      const updatedCart = cart.filter(item => item.id !== productId);
      setCart(updatedCart);
      
      if (product) {
        toast.success(`${product.name} removed from cart`);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setIsUpdating(true);
      const product = cart.find(item => item.id === productId);
      if (product) {
        const maxStock = product.stock_quantity ?? product.stock ?? 0;
        if (maxStock > 0 && quantity > maxStock) {
          toast.error(`Only ${maxStock} items available in stock`);
          setIsUpdating(false);
          return;
        }
      }
      
      const updatedCart = cart.map(item =>
        item.id === productId ? { ...item, quantity: Number(quantity) || 0 } : item
      );
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsUpdating(true);
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setIsUpdating(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => {
      const quantity = Number(item.quantity) || 0;
      return count + quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cart.length;
  };

  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? (Number(item.quantity) || 0) : 0;
  };

  const value = {
    cart,
    loading,
    isUpdating,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItemCount,
    isInCart,
    getItemQuantity
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;