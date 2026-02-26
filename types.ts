
export interface Product {
  id: string;
  slug?: string;
  variantId?: string;
  brand: string;
  name: string;
  price: string;
  priceMinor?: number;
  currency?: "UGX";
  originalPrice?: string;
  originalPriceMinor?: number;
  discount?: string;
  rating: number;
  reviews: number;
  reviewsCount?: number;
  imageUrl: string;
  badge?: string;
  isNew?: boolean;
  colors?: string[];
  sizes?: string[];
  description?: string;
  details?: string[];
  images?: string[];
  categorySlugs?: string[];
}

export interface Category {
  id: string;
  slug?: string;
  name: string;
  imageUrl: string;
  count?: number;
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
  avatarUrl?: string;
  role: 'CUSTOMER' | 'ADMIN';
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
