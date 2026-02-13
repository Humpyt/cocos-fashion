
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';

const ShoesPage: React.FC = () => {
  const categories: Category[] = [
    { id: 's1', name: 'Boots', imageUrl: 'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?auto=format&fit=crop&q=80&w=400' },
    { id: 's2', name: 'Sneakers', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c274d?auto=format&fit=crop&q=80&w=400' },
    { id: 's3', name: 'Heels', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400' },
    { id: 's4', name: 'Sandals', imageUrl: 'https://images.unsplash.com/photo-1621233819170-87b09966d73f?auto=format&fit=crop&q=80&w=400' },
    { id: 's5', name: 'Athletic', imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=400' },
    { id: 's6', name: 'Loafers', imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=400' },
  ];

  const deals: Category[] = [
    { id: 'sd1', name: 'ATHLETIC', label: '25-40% OFF', subtext: 'Nike, Adidas & more top brands.', imageUrl: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&q=80&w=600' },
    { id: 'sd2', name: 'BOOTS', label: '40-60% OFF', subtext: 'Clearance on winter styles.', imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600' },
    { id: 'sd3', name: 'LUXURY', label: '20% OFF', subtext: 'Designer shoes that shine.', imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=600' },
  ];

  const products: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `s-prod-${i}`,
    brand: "Steve Madden",
    name: "Women's Viable Pointed-Toe Booties",
    price: "$59.99",
    originalPrice: "$99.00",
    discount: "(39% off)",
    rating: 4.5,
    reviews: 512,
    imageUrl: `https://images.unsplash.com/photo-1542291026-7eec264c274d?auto=format&fit=crop&q=80&w=400&h=500&seed=shoes-${i}`,
    badge: "Limited Time"
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-stone-100 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1800" 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
          alt="Shoes Collection" 
        />
        <div className="relative z-10 text-center text-white drop-shadow-xl">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Step Into Style</h2>
          <p className="text-xl font-bold uppercase tracking-widest">BOOTS & SNEAKERS UP TO 50% OFF</p>
          <button className="mt-8 bg-black text-white px-12 py-3 font-bold uppercase hover:bg-gray-800 transition-colors">Shop Clearance</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Style</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Shoe Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Bestsellers</h2>
          <ProductSlider products={products} />
        </div>
      </div>
    </div>
  );
};

export default ShoesPage;
