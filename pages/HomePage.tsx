
import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import PresidentsDayHeader from '../components/PresidentsDayHeader';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import { Product, Category } from '../types';

interface HomePageProps {
  onNavigate?: (page: string) => void;
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlist?: Product[];
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onProductClick, onToggleWishlist, wishlist }) => {
  const [activeGiftCategory, setActiveGiftCategory] = useState('Jewelry');

  const topDeals: Category[] = [
    { 
      id: '1', 
      name: 'JEWELRY', 
      label: '20% off', 
      subtext: 'Transformative beauty & fragrance arrivals.',
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600' 
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
      label: 'UGX 550,000 & under', 
      subtext: 'Romantic date night dresses & more.',
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600' 
    },
    { 
      id: '4', 
      name: 'HANDBAGS', 
      label: 'Starting UGX 350,000', 
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
      brand: "EFFY COLLECTION",
      name: "Freshwater Pearl & Diamond Accent Necklace in 14k Gold",
      price: "UGX 549,000",
      originalPrice: "UGX 1,650,000",
      discount: "66% off",
      rating: 4.8,
      reviews: 312,
      imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=500",
      badge: "LIMITED TIME SPECIAL",
      colors: ['#D4AF37', '#E5E4E2']
    },
    {
      id: 'gift-2',
      brand: "DYSON",
      name: "Dyson Airwrap Multi-styler Complete Long in Nickel/Copper",
      price: "UGX 2,299,000",
      rating: 4.5,
      reviews: 1205,
      imageUrl: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&q=80&w=500",
      colors: ['#FF1493', '#C0C0C0', '#4169E1'],
      badge: "EXCLUSIVE"
    },
    {
      id: 'gift-3',
      brand: "APPLE",
      name: "Apple Watch Series 9 - Midnight Aluminum Case",
      price: "UGX 1,499,000",
      rating: 4.9,
      reviews: 840,
      imageUrl: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=500",
      colors: ['#191970', '#F5F5F5', '#800000', '#2F4F4F'],
      badge: "TOP RATED"
    },
    {
      id: 'gift-4',
      brand: "LEGO",
      name: "LEGO Icons Flower Bouquet Adult Building Set",
      price: "UGX 180,000",
      originalPrice: "UGX 220,000",
      discount: "20% off",
      rating: 5.0,
      reviews: 2450,
      imageUrl: "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&q=80&w=500",
      badge: "NEW ARRIVAL"
    },
    {
      id: 'gift-5',
      brand: "MICHAEL KORS",
      name: "Women's Pyper Brown Logo Strap Watch 38mm",
      price: "UGX 340,000",
      originalPrice: "UGX 550,000",
      discount: "40% off",
      rating: 4.6,
      reviews: 184,
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=500",
      badge: "BEST SELLER",
      colors: ['#8B4513', '#D4AF37', '#000000']
    },
    {
      id: 'gift-6',
      brand: "COACH",
      name: "Polished Pebble Leather Shoulder Bag in Chalk",
      price: "UGX 825,000",
      originalPrice: "UGX 1,250,000",
      discount: "35% off",
      rating: 4.8,
      reviews: 96,
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=500",
      colors: ['#000000', '#F5F5DC', '#A0522D'],
      badge: "STAFF PICK"
    }
  ];

  const trendingProducts: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `trend-${i}`,
    brand: "COCO'S SIGNATURE",
    name: "Women's Luxe Wool Blend Belted Wrap Coat in Camel",
    price: "UGX 549,990",
    originalPrice: "UGX 1,450,000",
    discount: "60% off",
    rating: 4.7,
    reviews: 2528,
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=500",
    colors: ['#8B4513', '#000000', '#778899', '#F5F5DC'],
    badge: "TRENDING"
  }));

  const giftCategories = ['Jewelry', 'Fragrance', 'Watches', 'Handbags', 'Gift sets'];
  
  const clearanceCategories = [
    { label: 'Women', route: 'women' },
    { label: 'Men', route: 'men' },
    { label: 'Shoes', route: 'shoes' },
    { label: 'Handbags', route: 'handbags' }
  ];

  return (
    <div className="bg-white">
      <PresidentsDayHeader />

      <section className="bg-white py-12">
        <HeroSlider />
      </section>

      {/* Rewards Banner - Refined Design */}
      <div className="w-full max-w-[1400px] mx-auto px-4 my-10">
        <div className="bg-black text-white py-10 relative overflow-hidden px-10 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8 border-l-[16px] border-cocos-orange group cursor-pointer transition-all hover:border-l-[24px]">
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF7D00 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
          <div className="flex flex-col items-start leading-none relative z-10">
              <span className="font-serif-promo text-[48px] font-normal tracking-tight text-cocos-orange">Style Rewards</span>
              <span className="text-[14px] font-black mt-2 uppercase tracking-[0.4em] text-white/50">EXCLUSIVE UG EVENT</span>
          </div>
          <div className="text-center relative z-10 max-w-2xl">
              <p className="text-2xl md:text-[34px] font-black tracking-tighter text-white leading-none mb-3">
                  Get UGX 40,000 Credit <span className="italic text-cocos-orange font-serif-promo font-normal">faster</span>
              </p>
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                  (That's 1,000 points) for every qualifying UGX 300,000 spent with a Coco's Style Card. <span className="underline text-cocos-orange hover:text-white transition-colors cursor-pointer">Exclusions & details</span>
              </p>
          </div>
          <div className="flex items-center gap-4 text-2xl font-black relative z-10 whitespace-nowrap text-white group-hover:text-cocos-orange transition-colors">
              <span className="text-3xl">★</span>
              <span>Coco's UG Rewards</span>
          </div>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="flex items-baseline gap-4 mb-12">
           <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Top Deals</h2>
           <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        <DealCardGrid categories={topDeals} />
      </section>

      {/* New Arrivals Section - Creative Filters */}
      <section className="max-w-[1400px] mx-auto px-4 py-24 border-t border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <span className="text-cocos-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block">Kampala Edit</span>
            <h2 className="text-[44px] font-black uppercase tracking-tight font-serif-promo italic leading-none">New arrivals in store</h2>
          </div>
          <div className="flex flex-wrap gap-10 text-[11px] font-black uppercase tracking-[0.2em] bg-gray-50 px-8 py-4 rounded-full">
              {giftCategories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveGiftCategory(cat)}
                  className={`transition-all pb-1.5 border-b-2 ${activeGiftCategory === cat ? 'border-cocos-orange text-cocos-orange' : 'text-gray-400 hover:text-black border-transparent'}`}
                >
                  {cat}
                </button>
              ))}
          </div>
        </div>
        <ProductSlider products={giftProducts} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} wishlist={wishlist} />
      </section>

      {/* Creative Campaign Section - THE DENIM EVENT */}
      <section className="max-w-[1400px] mx-auto px-4 py-24">
          <div className="relative h-[500px] bg-stone-100 overflow-hidden group shadow-2xl">
               <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1800" className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="The Denim Event" />
               <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/40 backdrop-blur-[2px]">
                  <div className="max-w-4xl px-8 transform transition-all duration-1000 group-hover:translate-y-[-20px]">
                    <span className="text-[14px] font-black tracking-[0.6em] uppercase text-cocos-orange mb-4 block">Spring Campaign '25</span>
                    <h2 className="text-[60px] md:text-[80px] font-black italic tracking-tighter mb-4 uppercase leading-[0.75] font-serif-promo">THE DENIM<br/><span className="text-cocos-orange">EVENT</span></h2>
                    <p className="text-xl md:text-2xl font-bold mb-10 tracking-wide uppercase opacity-90">30-40% OFF. SHOP THE LATEST FITS, WASHES & TRENDS.</p>
                    <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
                        <button onClick={() => onNavigate?.('women')} className="bg-black text-white px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-black transition-all shadow-2xl">Shop Denim</button>
                        <button onClick={() => onNavigate?.('men')} className="bg-white text-black px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-white transition-all shadow-2xl">View Lookbook</button>
                    </div>
                  </div>
               </div>

               {/* Requested Left Menu Integration per Screenshot Annotations */}
               <div className="absolute left-12 bottom-12 hidden md:block border-l-4 border-cocos-orange pl-8">
                  <div className="flex flex-col gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-white">
                    <button onClick={() => onNavigate?.('women')} className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Women</button>
                    <button onClick={() => onNavigate?.('men')} className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Men</button>
                    <button onClick={() => onNavigate?.('shoes')} className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Shoes</button>
                    <button onClick={() => onNavigate?.('home')} className="text-left hover:text-cocos-orange">Shop All Denim</button>
                  </div>
               </div>
          </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-24 border-t border-gray-100">
          <div className="flex items-baseline gap-4 mb-16">
            <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Trending Now</h2>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>
          <ProductSlider products={trendingProducts} onProductClick={onProductClick} onToggleWishlist={onToggleWishlist} wishlist={wishlist} />
      </section>

      {/* Massive Creative Footer CTA */}
      <div className="bg-black text-white py-40 mt-24 border-y-[16px] border-cocos-orange relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-cocos-orange/5 skew-x-12 translate-x-1/4"></div>
          <div className="max-w-[1400px] mx-auto px-4 text-center relative z-10">
              <h2 className="text-[80px] md:text-[140px] font-black italic mb-10 uppercase tracking-tighter leading-none font-serif-promo">CLEARANCE<br/><span className="text-cocos-orange">40-70% OFF</span></h2>
              <p className="text-[18px] md:text-[22px] font-black mb-20 uppercase tracking-[0.8em] text-gray-500">FINAL MARKDOWNS — GET IT BEFORE IT'S GONE</p>
              <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                  {clearanceCategories.map(cat => (
                      <button 
                        key={cat.label} 
                        onClick={() => onNavigate?.(cat.route)}
                        className="group relative overflow-hidden bg-cocos-orange text-black px-12 py-5 font-black text-[13px] min-w-[180px] uppercase tracking-[0.3em] transition-all"
                      >
                        <span className="relative z-10 group-hover:text-white transition-colors">{cat.label}</span>
                        <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      </button>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default HomePage;
