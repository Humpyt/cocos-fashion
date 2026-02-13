
export interface Product {
  id: string;
  brand: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  badge?: string;
  isNew?: boolean;
  colors?: string[];
  sizes?: string[];
  description?: string;
  details?: string[];
  images?: string[];
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  label?: string;
  subtext?: string;
}

export interface CartItem extends Product {
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  starRewardsTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  nextTierPoints: number;
}

export interface Order {
  id: string;
  date: string;
  total: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    name: string;
    imageUrl: string;
  }[];
}
