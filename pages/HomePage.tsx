
import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import PresidentsDayHeader from '../components/PresidentsDayHeader';
import FurniturePromo from '../components/FurniturePromo';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import { Product, Category } from '../types';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onProductClick?: (product: Product) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onProductClick }) => {
  const [activeGiftCategory, setActiveGiftCategory] = useState('Jewelry');

  const topDeals: Category[] = [
    { 
      id: '1', 
      name: 'JEWELRY', 
      label: '20% off', 
      subtext: 'Transformative beauty & fragrance arrivals.',
      imageUrl: 'https://images.unsplash.com/photo-1544468266-6a8948003cd7?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '2', 
      name: 'BOOTS', 
      label: '40-60% off', 
      subtext: 'Outfit-boosting boots.',
      imageUrl: 'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '3', 
      name: 'DRESSES', 
      label: '$150 and under', 
      subtext: 'Romantic date night dresses & more.',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '4', 
      name: 'HANDBAGS', 
      label: 'Starting at $99.99', 
      subtext: 'Designer handbags that turn heads.',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '5', 
      name: 'ACTIVEWEAR', 
      label: '25-40% off', 
      subtext: 'Activewear and outdoor gear for the whole family.',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '6', 
      name: 'HOME', 
      label: 'Up to 65% off', 
      subtext: 'Fresh updates for every room.',
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '7', 
      name: 'MATTRESSES', 
      label: 'Extra 10% off', 
      subtext: 'Great sleep starts with a great deal.',
      imageUrl: 'https://images.unsplash.com/photo-1505693419173-42b9258a6347?auto=format&fit=crop&q=80&w=600' 
    }
  ];

  const giftProducts: Product[] = [
    {
      id: 'gift-1',
      brand: "EFFY Collection",
      name: "Freshwater Pearl & Diamond Accent Necklace in 14k Gold",
      price: "$149.00",
      originalPrice: "$450.00",
      discount: "(66% off)",
      rating: 4.8,
      reviews: 312,
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=500",
      badge: "Limited Time Special",
      colors: ['#D4AF37', '#E5E4E2']
    },
    {
      id: 'gift-2',
      brand: "Dyson",
      name: "Dyson Airwrap Multi-styler Complete Long",
      price: "$599.99",
      rating: 4.5,
      reviews: 1205,
      imageUrl: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=500",
      colors: ['#FF1493', '#C0C0C0', '#4169E1']
    },
    {
      id: 'gift-3',
      brand: "Apple",
      name: "Apple iPhone 14 128GB - Midnight (Unlocked)",
      price: "$699.00",
      rating: 4.9,
      reviews: 840,
      imageUrl: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=500",
      colors: ['#191970', '#F5F5F5', '#800000', '#2F4F4F']
    },
    {
      id: 'gift-4',
      brand: "Lego",
      name: "LEGO Icons Flower Bouquet Building Set",
      price: "$47.99",
      originalPrice: "$59.99",
      discount: "(20% off)",
      rating: 5.0,
      reviews: 2450,
      imageUrl: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=500"
    },
    {
      id: 'gift-5',
      brand: "Michael Kors",
      name: "Women's Pyper Brown Logo Strap Watch 38mm",
      price: "$89.99",
      originalPrice: "$150.00",
      discount: "(40% off)",
      rating: 4.6,
      reviews: 184,
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=500",
      badge: "Limited Time Special",
      colors: ['#8B4513', '#D4AF37', '#000000']
    },
    {
      id: 'gift-6',
      brand: "Coach",
      name: "Polished Pebble Leather Shoulder Bag",
      price: "$225.00",
      originalPrice: "$350.00",
      discount: "(35% off)",
      rating: 4.8,
      reviews: 96,
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=500",
      colors: ['#000000', '#F5F5DC', '#A0522D']
    }
  ];

  const trendingProducts: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `trend-${i}`,
    brand: "Coco's Style",
    name: "Womens Wool Blend Belted Wrap Coat",
    price: "$99.99",
    discount: "(75% off)",
    rating: 4.7,
    reviews: 2528,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=500",
    colors: ['#8B4513', '#000000', '#778899', '#F5F5DC']
  }));

  const giftCategories = ['Jewelry', 'Fragrance', 'Watches', 'Handbags', 'Gift sets'];
  
  const clearanceCategories = [
    { label: 'Women', route: 'women' },
    { label: 'Men', route: 'men' },
    { label: 'Shoes', route: 'shoes' },
    { label: 'Handbags', route: 'handbags' },
    { label: 'Gifts', route: 'gifts' },
    { label: 'Now & Trending', route: 'now' },
    { label: 'Sale', route: 'sale' },
    { label: 'Shop All', route: 'home' }
  ];

  return (
    <>
      <PresidentsDayHeader />

      <section className="bg-white py-4">
        <HeroSlider />
      </section>

      <div className="w-full max-w-[1400px] mx-auto px-4 my-6">
        <div className="bg-black text-white py-7 relative overflow-hidden px-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 border-l-[12px] border-cocos-orange">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF7D00 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="flex flex-col items-start leading-none relative z-10">
              <span className="font-serif-promo text-[42px] font-normal tracking-tight text-cocos-orange">Style Rewards</span>
              <span className="text-[14px] font-bold mt-1 uppercase tracking-wider">now-Feb. 28</span>
          </div>
          <div className="text-center relative z-10 max-w-2xl">
              <p className="text-2xl md:text-[28px] font-bold tracking-tight text-white leading-tight">
                  Get $10 in Coco's Credit <span className="italic text-cocos-orange font-serif-promo font-normal">faster</span> (that's 1,000 points)
              </p>
              <p className="text-[11px] font-medium mt-1.5 text-white/90">
                  for every qualifying $75 spent with a Coco's Style Card or $100 spent as a Bronze member. <span className="underline cursor-pointer font-bold text-cocos-orange">Exclusions & details</span>
              </p>
          </div>
          <div className="flex items-center gap-2 text-xl font-bold relative z-10 whitespace-nowrap text-cocos-orange">
              <span>★ Coco's Rewards</span>
          </div>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <h2 className="text-[28px] font-black tracking-tight mb-8 text-black">Coco's Top Deals</h2>
        <DealCardGrid categories={topDeals} />
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold">New arrivals in store</h2>
          <div className="flex flex-wrap gap-6 text-[11px] font-bold uppercase tracking-wider">
              {giftCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveGiftCategory(cat)}
                  className={`transition-all pb-1 ${activeGiftCategory === cat ? 'border-b-2 border-cocos-orange text-cocos-orange' : 'text-gray-500 hover:text-black border-b-2 border-transparent'}`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>
        <ProductSlider products={giftProducts} onProductClick={onProductClick} />
      </section>

      <FurniturePromo />

      <section className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="relative h-[620px] bg-gray-200 overflow-hidden mb-12">
               <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1800" className="w-full h-full object-cover" alt="The Denim Event" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/30">
                  <h2 className="text-6xl font-black italic tracking-tighter mb-4 uppercase leading-none">THE DENIM EVENT<br/><span className="text-[72px] text-cocos-orange">30-40% OFF</span></h2>
                  <p className="text-lg font-bold mb-10 tracking-wide uppercase">Shop the latest fits, washes & trends. Ends 2/28.</p>
                  <div className="flex gap-4">
                      <button onClick={() => onNavigate?.('women')} className="bg-white text-black px-12 py-4 font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors">Women</button>
                      <button onClick={() => onNavigate?.('men')} className="bg-white text-black px-12 py-4 font-bold uppercase text-xs tracking-widest hover:bg-gray-100 transition-colors">Men</button>
                  </div>
               </div>
          </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-16 border-t border-gray-100">
          <h2 className="text-2xl font-bold mb-8">Coco's Trending Now</h2>
          <ProductSlider products={trendingProducts} onProductClick={onProductClick} />
      </section>

      <div className="bg-black text-white py-20 mt-12 border-y-4 border-cocos-orange">
          <div className="max-w-[1400px] mx-auto px-4 text-center">
              <h2 className="text-[64px] font-black italic mb-6 uppercase tracking-tighter leading-none">CLEARANCE <span className="text-cocos-orange">40-70% OFF</span></h2>
              <p className="text-[14px] font-bold mb-12 uppercase tracking-[0.4em] text-gray-300">GET IT BEFORE IT’S GONE!</p>
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                  {clearanceCategories.map(cat => (
                      <button 
                        key={cat.label} 
                        onClick={() => onNavigate?.(cat.route)}
                        className="bg-cocos-orange text-black px-10 py-3 font-bold text-[11px] min-w-[140px] uppercase tracking-widest hover:bg-white transition-colors"
                      >
                        {cat.label}
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </>
  );
};

export default HomePage;
