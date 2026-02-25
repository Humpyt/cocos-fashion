
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Category } from '../types';

interface Props {
  categories: Category[];
}

const DealCardGrid: React.FC<Props> = ({ categories }) => {
  const fallbackImage = '/women.jpg';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      // Use ResizeObserver for more reliable scroll checking on window resize
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        ro.disconnect();
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/grid w-full">
      {/* Left Navigation Arrow */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute -left-6 top-[40%] -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all z-30"
          aria-label="Scroll left"
        >
          <ChevronLeft size={28} className="text-black" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-[18px] overflow-x-auto hide-scrollbar snap-x snap-mandatory px-1"
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative min-w-[280px] md:min-w-[340px] aspect-[4/5] bg-gray-100 snap-start cursor-pointer group/card flex-shrink-0 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
          >
            {/* Image with zoom effect */}
            <img
              src={cat.imageUrl}
              alt={cat.name}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallbackApplied === '1') {
                  return;
                }
                target.dataset.fallbackApplied = '1';
                target.src = fallbackImage;
              }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
            />

            {/* Dark Gradient Bottom Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover/card:opacity-90"></div>

            {/* Discount Tag - Top Right */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-cocos-orange text-white px-4 py-1.5 font-black text-sm uppercase tracking-tighter shadow-lg transform -rotate-2 group-hover/card:rotate-0 transition-transform">
                {cat.label}
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-6 md:p-8 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-500">
              <p className="text-cocos-orange text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-2 drop-shadow-sm">
                {cat.name}
              </p>
              <h3 className="text-white text-2xl md:text-3xl font-black italic tracking-tighter leading-tight uppercase mb-3 font-serif-promo">
                {cat.subtext?.split(' ').slice(0, 3).join(' ') || 'Seasonal Deals'}
              </h3>

              {/* Animated Underline */}
              <div className="h-1 w-12 bg-cocos-orange transition-all duration-500 group-hover/card:w-full"></div>

              {cat.subtext && (
                <p className="text-gray-300 text-[11px] md:text-[12px] font-medium leading-relaxed mt-4 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                  {cat.subtext}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right Navigation Arrow */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute -right-6 top-[40%] -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all z-30"
          aria-label="Scroll right"
        >
          <ChevronRight size={28} className="text-black" />
        </button>
      )}
    </div>
  );
};

export default DealCardGrid;
