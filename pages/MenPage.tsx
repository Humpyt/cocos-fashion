
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';

interface Props {
  onProductClick?: (product: Product) => void;
}

const MenPage: React.FC<Props> = ({ onProductClick }) => {
  const categories: Category[] = [
    { id: 'm1', name: 'Shirts', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400' },
    { id: 'm2', name: 'Suits', imageUrl: 'https://images.unsplash.com/photo-1594932224011-041d83b1ba4d?auto=format&fit=crop&q=80&w=400' },
    { id: 'm3', name: 'Shoes', imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=400' },
    { id: 'm4', name: 'Watches', imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=400' },
    { id: 'm5', name: 'Activewear', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400' },
    { id: 'm6', name: 'Denim', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400' },
  ];

  const deals: Category[] = [
    { id: 'md1', name: 'SUITING', label: '40-60% OFF', subtext: 'Look sharp for any occasion.', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600' },
    { id: 'md2', name: 'BOOTS', label: 'UP TO 50% OFF', subtext: 'Rugged styles for everyday.', imageUrl: 'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?auto=format&fit=crop&q=80&w=600' },
    { id: 'md3', name: 'ACTIVE', label: '2 FOR $40', subtext: 'Moisture-wicking essentials.', imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600' },
  ];

  const products: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `m-prod-${i}`,
    brand: "Calvin Klein",
    name: "Men's Slim-Fit Non-Iron Stretch Shirt",
    price: "$49.99",
    originalPrice: "$79.50",
    discount: "(37% off)",
    rating: 4.6,
    reviews: 840,
    imageUrl: `https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=400&h=500&seed=men-${i}`,
    badge: "Limited Time",
    colors: ['#FFFFFF', '#87CEEB', '#191970']
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-blue-900 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=1800" 
          className="absolute inset-0 w-full h-full object-cover opacity-70" 
          alt="Men's Fashion" 
        />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Master the Season</h2>
          <p className="text-xl font-bold uppercase tracking-widest">DESIGNER SUITING & SHOES 40-60% OFF</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Suiting</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Best Men's Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Popular Right Now</h2>
          <ProductSlider products={products} onProductClick={onProductClick} />
        </div>
      </div>
    </div>
  );
};

export default MenPage;
