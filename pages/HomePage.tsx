import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import PresidentsDayHeader from '../components/PresidentsDayHeader';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import { Product, Category } from '../types';
import { getImageByIndex } from '../imageStore';

interface HomePageProps {
  apiProducts?: Product[];
  onNavigate?: (page: string) => void;
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const HomePage: React.FC<HomePageProps> = ({ apiProducts = [], onProductClick, onNavigate, onToggleWishlist, onAddToBag, onQuickView, wishlist = [] }) => {
  const [activeGiftCategory, setActiveGiftCategory] = useState('New Arrivals');

  const topDeals: Category[] = [
    {
      id: '1',
      name: 'JEWELRY',
      label: '20% off',
      subtext: 'Transformative beauty & fragrance arrivals.',
      imageUrl: getImageByIndex(80)
    },
    {
      id: '2',
      name: 'BOOTS',
      label: '40-60% off',
      subtext: 'The absolute best in outfit-boosting boots.',
      imageUrl: getImageByIndex(40)
    },
    {
      id: '3',
      name: 'DRESSES',
      label: 'Under 550k',
      subtext: 'Romantic date night essentials & more.',
      imageUrl: getImageByIndex(0)
    },
    {
      id: '4',
      name: 'HANDBAGS',
      label: 'From 350k',
      subtext: 'Designer handbags that turn every head.',
      imageUrl: getImageByIndex(60)
    },
    {
      id: '5',
      name: 'ACTIVEWEAR',
      label: '30% off',
      subtext: 'Gearing up for the whole family.',
      imageUrl: getImageByIndex(15)
    },
    {
      id: '6',
      name: 'HOME',
      label: '65% off',
      subtext: 'Fresh updates for every modern room.',
      imageUrl: getImageByIndex(94)
    },
    {
      id: '7',
      name: 'MATTRESSES',
      label: '+10% off',
      subtext: 'Great sleep starts with a great deal.',
      imageUrl: getImageByIndex(95)
    }
  ];

  const giftProducts = apiProducts.slice(0, 5);
  const trendingProducts = apiProducts.slice(5, 13);

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

      <div className="w-full max-w-[1600px] mx-auto px-4 my-10">
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
            <span className="text-3xl">*</span>
            <span>Coco's UG Rewards</span>
          </div>
        </div>
      </div>

      <section className="max-w-[1600px] mx-auto px-4 py-20">
        <div className="flex items-baseline gap-4 mb-12">
          <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Top Deals</h2>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        <DealCardGrid categories={topDeals} />
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-gray-100">
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
        {giftProducts.length ? (
          <ProductSlider
            products={giftProducts}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlist={wishlist}
          />
        ) : (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">No products available yet.</div>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-24">
        <div className="relative h-[500px] bg-stone-100 overflow-hidden group shadow-2xl">
          <img src={getImageByIndex(24)} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="The Denim Event" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/40 backdrop-blur-[2px]">
            <div className="max-w-4xl px-8 transform transition-all duration-1000 group-hover:translate-y-[-20px]">
              <span className="text-[14px] font-black tracking-[0.6em] uppercase text-cocos-orange mb-4 block">Spring Campaign '25</span>
              <h2 className="text-[60px] md:text-[80px] font-black italic tracking-tighter mb-4 uppercase leading-[0.75] font-serif-promo">THE DENIM<br /><span className="text-cocos-orange">EVENT</span></h2>
              <p className="text-xl md:text-2xl font-bold mb-10 tracking-wide uppercase opacity-90">30-40% OFF. SHOP THE LATEST FITS, WASHES & TRENDS.</p>
              <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
                <button onClick={() => onNavigate?.('women')} className="bg-black text-white px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-black transition-all shadow-2xl">Shop Denim</button>
                <button onClick={() => onNavigate?.('men')} className="bg-white text-black px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-white transition-all shadow-2xl">View Lookbook</button>
              </div>
            </div>
          </div>

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

      <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-gray-100">
        <div className="flex items-baseline gap-4 mb-16">
          <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Trending Now</h2>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        {trendingProducts.length ? (
          <ProductSlider
            products={trendingProducts}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlist={wishlist}
          />
        ) : (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">No products available yet.</div>
        )}
      </section>

      <div className="bg-black text-white py-40 mt-24 border-y-[16px] border-cocos-orange relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cocos-orange/5 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-[1600px] mx-auto px-4 text-center relative z-10">
          <h2 className="text-[48px] sm:text-[60px] md:text-[140px] font-black italic mb-10 uppercase tracking-tighter leading-none font-serif-promo">
            CLEARANCE<br />
            <span className="text-cocos-orange">40-70% OFF</span>
          </h2>
          <p className="text-[13px] md:text-[22px] font-black mb-20 uppercase tracking-[0.4em] md:tracking-[0.8em] text-gray-500">FINAL MARKDOWNS - GET IT BEFORE IT'S GONE</p>
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
