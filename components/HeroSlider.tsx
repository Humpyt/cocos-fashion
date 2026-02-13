
import React from 'react';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';

const HeroSlider: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 relative group">
      <div className="relative w-full h-[540px] bg-[#F191B0] overflow-hidden rounded-none shadow-sm flex items-center">
        {/* Background Decorative Flowers (Simulated with an image) */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay" 
            alt="Floral Background" 
          />
        </div>

        {/* Product Shot Area (Right Side) */}
        <div className="absolute right-0 top-0 w-2/3 h-full z-10 hidden md:block">
           <div className="relative w-full h-full flex items-center justify-center">
              {/* Product arrangement simulation */}
              <img 
                src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=1000" 
                className="w-auto h-[80%] object-contain" 
                alt="Lancome Products" 
              />
              {/* "OR" Badge */}
              <div className="absolute top-[60%] right-[40%] bg-black text-white text-xs font-bold w-10 h-10 rounded-full flex items-center justify-center border border-white/20">
                OR
              </div>
           </div>
        </div>

        {/* Text Content Overlay (Left Side) */}
        <div className="relative z-20 w-full md:w-1/2 pl-12 md:pl-20 py-12 flex flex-col justify-center">
            <h2 className="font-serif-promo text-[52px] md:text-[68px] leading-[1.05] tracking-tight mb-6">
              Free Lancôme<br/>
              8-pc. gift—up to<br/>
              $204 value
            </h2>
            <p className="text-sm font-bold leading-tight mb-8 max-w-xs">
              With any $39.50 Lancôme purchase.<br/>
              One per customer, while supplies last.
            </p>
            <button className="bg-white text-black px-10 py-2.5 text-sm font-bold rounded-full w-fit hover:bg-gray-100 transition-colors shadow-sm">
              Shop now
            </button>
        </div>

        {/* Navigation Arrows */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 w-10 h-10 rounded-full flex items-center justify-center shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft size={24} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 w-10 h-10 rounded-full flex items-center justify-center shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={24} />
        </button>

        {/* Pagination Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
           <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-black/30 cursor-pointer"></div>
              <div className="w-2 h-2 rounded-full bg-black cursor-pointer"></div>
              <div className="w-2 h-2 rounded-full bg-black/30 cursor-pointer"></div>
              <div className="w-2 h-2 rounded-full bg-black/30 cursor-pointer"></div>
           </div>
           <Pause size={14} className="cursor-pointer fill-black" />
           <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-black/30 cursor-pointer"></div>
              <div className="w-2 h-2 rounded-full bg-black/30 cursor-pointer"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
