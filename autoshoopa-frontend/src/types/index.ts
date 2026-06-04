export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'customer' | 'seller';
  created_at: string;
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  image: string;
  created_at: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
} 