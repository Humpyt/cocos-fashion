
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';

interface Props {
  onProductClick?: (product: Product) => void;
}

const WomenPage: React.FC<Props> = ({ onProductClick }) => {
  const categories: Category[] = [
    { id: 'w1', name: 'Dresses', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400' },
    { id: 'w2', name: 'Coats', imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400' },
    { id: 'w3', name: 'Shoes', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400' },
    { id: 'w4', name: 'Handbags', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400' },
    { id: 'w5', name: 'Activewear', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400' },
    { id: 'w6', name: 'Jewelry', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' },
  ];

  const deals: Category[] = [
    { id: 'd1', name: 'CLOTHING', label: '30-50% OFF', subtext: 'Fresh arrivals in every fit.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600' },
    { id: 'd2', name: 'SHOES', label: 'UP TO 40% OFF', subtext: 'Boots, heels & sneakers.', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600' },
    { id: 'd3', name: 'ACCESSORIES', label: 'BUY 1 GET 1 50% OFF', subtext: 'Scarves, hats & more.', imageUrl: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&q=80&w=600' },
  ];

  const products: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `w-prod-${i}`,
    brand: "Free People",
    name: "Women's Floral Maxi Dress, Created for Macy's",
    price: "$79.99",
    originalPrice: "$128.00",
    discount: "(38% off)",
    rating: 4.8,
    reviews: 120,
    imageUrl: `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=500&seed=women-${i}`,
    badge: "Best Seller",
    colors: ['#FFE4E1', '#E6E6FA', '#F0FFF0']
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-pink-100 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1800" 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
          alt="Women's Fashion" 
        />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Spring Starts Here</h2>
          <p className="text-xl font-bold uppercase tracking-widest">30-50% OFF NEW ARRIVALS</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Now</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Exclusive Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Trending Now</h2>
          <ProductSlider products={products} onProductClick={onProductClick} />
        </div>
      </div>
    </div>
  );
};

export default WomenPage;
