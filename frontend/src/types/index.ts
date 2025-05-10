export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface Order {
  id: number;
  userId: number;
  products: OrderProduct[];
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  totalAmount: number;
  createdAt: string;
}

export interface OrderProduct {
  productId: number;
  quantity: number;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
} 