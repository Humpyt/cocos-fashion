
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Spring starts with Coco's",
    subtitle: "SPRING '25 PREVIEW",
    description: "Fresh palettes, airy fits & timeless staples. Unlock early access for Style Rewards members.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
    bgColor: "bg-[#F7F3F0]",
    ctaPrimary: "Shop Women",
    ctaSecondary: "Shop Men",
    productBadge: {
      name: "SILKY SATIN SLIP DRESS",
      price: "UGX 330,000",
      tag: "NEW ARRIVAL"
    }
  },
  {
    id: 2,
    title: "The Denim Event",
    subtitle: "PERFECT FITS FOR ALL",
    description: "30-40% OFF. Shop the latest washes, fits, and trends that define the season.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=2000",
    bgColor: "bg-[#E5EAEF]",
    ctaPrimary: "Shop Denim",
    ctaSecondary: "View Lookbook",
    productBadge: {
      name: "VINTAGE HIGH RISE STRAIGHT",
      price: "UGX 200,000",
      tag: "BEST SELLER"
    }
  },
  {
    id: 3,
    title: "Luxury Defined",
    subtitle: "PREMIUM ACCESSORIES",
    description: "Up to 20% off fine jewelry and designer handbags. Elevate your everyday style.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=2000",
    bgColor: "bg-[#F4F1ED]",
    ctaPrimary: "Shop Jewelry",
    ctaSecondary: "Shop Handbags",
    productBadge: {
      name: "PEBBLED LEATHER TOTE",
      price: "UGX 720,000",
      tag: "EDITOR'S CHOICE"
    }
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 relative group overflow-hidden">
      <div className="relative w-full h-[650px] bg-stone-100 flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform ${
              index === current ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-8'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                className="w-full h-full object-cover"
                alt={slide.title}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 h-full w-full md:w-[60%] pl-12 md:pl-24 flex flex-col justify-center">
              <div className={`transition-all duration-1000 delay-300 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-[2px] w-12 bg-cocos-orange"></span>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-cocos-orange">{slide.subtitle}</span>
                </div>
                
                <h2 className="font-serif-promo text-[60px] md:text-[88px] leading-[0.85] tracking-tighter mb-8 text-black">
                  {slide.title.split(' ').map((word, i) => 
                    word.toLowerCase().includes("coco's") || word.toLowerCase().includes("coco") 
                    ? <span key={i} className="italic text-cocos-orange font-normal"> {word}</span> 
                    : <span key={i}> {word}</span>
                  )}
                </h2>

                <p className="text-lg md:text-xl font-medium text-gray-700 max-w-md mb-12 leading-relaxed">
                  {slide.description}
                </p>

                <div className="flex items-center gap-6">
                  <button className="bg-black text-white px-12 py-5 text-xs font-black uppercase tracking-widest hover:bg-cocos-orange hover:text-black transition-all shadow-xl">
                    {slide.ctaPrimary}
                  </button>
                  <button className="border-2 border-black text-black px-12 py-5 text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                    {slide.ctaSecondary}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Badge / Floating Promo */}
            <div className={`absolute right-[10%] top-[25%] z-20 hidden lg:block transition-all duration-1000 delay-500 transform ${index === current ? 'translate-x-0 opacity-100' : 'translate-x-16 opacity-0'}`}>
              <div className="bg-white p-8 shadow-2xl border-t-[6px] border-cocos-orange max-w-[260px] text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cocos-orange mb-3">{slide.productBadge.tag}</p>
                <h4 className="text-2xl font-black tracking-tight leading-tight mb-4 font-serif-promo text-black">{slide.productBadge.name}</h4>
                <p className="text-4xl font-black text-black mb-6">{slide.productBadge.price}</p>
                <button className="text-[11px] font-black underline uppercase tracking-widest hover:text-cocos-orange transition-colors">SHOP ITEM</button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/80 w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-30 opacity-0 group-hover:opacity-100 transition-all hover:bg-cocos-orange hover:text-white"
        >
          <ChevronLeft size={36} />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/80 w-16 h-16 rounded-full flex items-center justify-center shadow-xl z-30 opacity-0 group-hover:opacity-100 transition-all hover:bg-cocos-orange hover:text-white"
        >
          <ChevronRight size={36} />
        </button>

        {/* Pagination & Play/Pause */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 bg-white/40 backdrop-blur-md px-8 py-3.5 rounded-full border border-white/50">
           <div className="flex gap-4">
              {slides.map((_, i) => (
                <div 
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 transition-all duration-500 cursor-pointer rounded-full ${
                    i === current ? 'w-12 bg-black' : 'w-4 bg-black/20 hover:bg-black/40'
                  }`}
                />
              ))}
           </div>
           <div className="w-px h-6 bg-black/20"></div>
           <button onClick={() => setIsPaused(!isPaused)} className="text-black hover:text-cocos-orange transition-colors">
             {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
