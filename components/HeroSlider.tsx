import React, { useState, useEffect, useCallback } from 'react';
import { getImageByIndex } from '../imageStore';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Spring starts with Coco's",
    subtitle: "SPRING '25 PREVIEW",
    description: "Fresh palettes, airy fits & timeless staples. Unlock early access for members.",
    image: getImageByIndex(18),
    ctaPrimary: "Shop Women",
    ctaSecondary: "Shop Men",
    productBadge: { name: "SILKY SATIN SLIP DRESS", price: "UGX 330,000", tag: "NEW ARRIVAL" }
  },
  {
    id: 2,
    title: "The Denim Event",
    subtitle: "UP TO 40% OFF",
    description: "Find your perfect fit. From high-rise skinnies to refined flares.",
    image: getImageByIndex(19),
    ctaPrimary: "Shop Denim",
    ctaSecondary: "Style Guide",
    productBadge: { name: "ULTRA-WIDE LEG JEANS", price: "UGX 185,000", tag: "TRENDING" }
  },
  {
    id: 3,
    title: "The Accessories Edit",
    subtitle: "PURE ELEGANCE",
    description: "Complete your look with our curated selection of designer handbags and luxury jewelry.",
    image: getImageByIndex(70),
    ctaPrimary: "Shop Bags",
    ctaSecondary: "View Jewelry",
    productBadge: { name: "QUILTED LEATHER TOTE", price: "UGX 1,450,000", tag: "EXCLUSIVE" }
  },
  {
    id: 4,
    title: "Elevated Masculinity",
    subtitle: "REFINED STYLE",
    description: "Sharp tailoring meets contemporary comfort. Explore the new standard for the modern man.",
    image: getImageByIndex(21),
    ctaPrimary: "Shop Men",
    ctaSecondary: "New Arrivals",
    productBadge: { name: "ITALIAN WOOL BLAZER", price: "UGX 850,000", tag: "PREMIUM" }
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-0 md:px-4 relative group overflow-hidden">
      <div className="relative w-full h-[500px] md:h-[650px] bg-stone-100 flex items-center">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <div className="absolute inset-0">
              <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 md:from-white/90 via-white/40 to-transparent"></div>
            </div>

            <div className="relative z-20 h-full w-full md:w-[60%] px-6 md:pl-24 flex flex-col justify-center">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <span className="h-[2px] w-8 md:w-12 bg-cocos-orange"></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-cocos-orange">{slide.subtitle}</span>
              </div>

              <h2 className="font-serif-promo text-[40px] md:text-[88px] leading-[1] md:leading-[0.85] tracking-tighter mb-6 md:mb-8 text-black">
                {slide.title.split(' ').map((word, i) =>
                  word.toLowerCase().includes("coco") ? <span key={i} className="italic text-cocos-orange font-normal"> {word}</span> : <span key={i}> {word}</span>
                )}
              </h2>

              <p className="text-sm md:text-xl font-medium text-gray-700 max-w-xs md:max-w-md mb-8 md:mb-12 leading-relaxed">
                {slide.description}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-6">
                <button className="bg-black text-white px-8 md:px-12 py-4 md:py-5 text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-cocos-orange hover:text-black transition-all shadow-lg">
                  {slide.ctaPrimary}
                </button>
                <button className="border-2 border-black text-black px-8 md:px-12 py-4 md:py-5 text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                  {slide.ctaSecondary}
                </button>
              </div>
            </div>

            {/* Product Badge - Hidden on Small Screens */}
            <div className="absolute right-[8%] top-[25%] z-20 hidden lg:block transition-all duration-1000 delay-500">
              <div className="bg-white p-6 shadow-2xl border-t-4 border-cocos-orange max-w-[220px] text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cocos-orange mb-2">{slide.productBadge.tag}</p>
                <h4 className="text-xl font-black tracking-tight leading-tight mb-3 font-serif-promo text-black">{slide.productBadge.name}</h4>
                <p className="text-3xl font-black text-black mb-4">{slide.productBadge.price}</p>
                <button className="text-[10px] font-black underline uppercase tracking-widest hover:text-cocos-orange transition-colors">SHOP ITEM</button>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination Dots - Optimized for Mobile */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/50">
          {slides.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} className={`h-1.5 transition-all duration-500 cursor-pointer rounded-full ${i === current ? 'w-8 bg-black' : 'w-2 bg-black/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
