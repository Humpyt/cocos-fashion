
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';

const HandbagsPage: React.FC = () => {
  const categories: Category[] = [
    { id: 'h1', name: 'Totes', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400' },
    { id: 'h2', name: 'Crossbody', imageUrl: 'https://images.unsplash.com/photo-1591375275653-0660a4ff2467?auto=format&fit=crop&q=80&w=400' },
    { id: 'h3', name: 'Shoulder Bags', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400' },
    { id: 'h4', name: 'Satchels', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400' },
    { id: 'h5', name: 'Backpacks', imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400' },
    { id: 'h6', name: 'Clutches', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=400' },
  ];

  const deals: Category[] = [
    { id: 'hd1', name: 'DESIGNER', label: 'STARTING AT $129', subtext: 'Coach, Michael Kors & Kate Spade.', imageUrl: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=600' },
    { id: 'hd2', name: 'TRAVEL', label: 'UP TO 40% OFF', subtext: 'Luggage & weekenders for your next trip.', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eebda4527a?auto=format&fit=crop&q=80&w=600' },
    { id: 'hd3', name: 'WALLETS', label: 'BUY 1 GET 1 FREE', subtext: 'Small leather goods to match.', imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600' },
  ];

  const products: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `h-prod-${i}`,
    brand: "Michael Kors",
    name: "Jet Set Large Saffiano Leather Crossbody Bag",
    price: "$149.00",
    originalPrice: "$298.00",
    discount: "(50% off)",
    rating: 4.9,
    reviews: 2105,
    imageUrl: `https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400&h=500&seed=handbags-${i}`,
    badge: "Top Rated"
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-amber-50 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1800" 
          className="absolute inset-0 w-full h-full object-cover opacity-90" 
          alt="Handbags Collection" 
        />
        <div className="relative z-10 text-center text-white drop-shadow-2xl">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">The Designer Event</h2>
          <p className="text-xl font-bold uppercase tracking-widest">LUXURY HANDBAGS STARTING AT $149</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Designer</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Silhouette</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Handbag Hot Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Most Wanted</h2>
          <ProductSlider products={products} />
        </div>
      </div>
    </div>
  );
};

export default HandbagsPage;
