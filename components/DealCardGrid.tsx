
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Category } from '../types';

interface Props {
  categories: Category[];
}

const DealCardGrid: React.FC<Props> = ({ categories }) => {
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
            className="relative min-w-[280px] md:min-w-[310px] aspect-[4/5] bg-[#F3F3F3] snap-start cursor-pointer group/card flex-shrink-0"
          >
            {/* Image */}
            <img 
              src={cat.imageUrl} 
              alt={cat.name} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.02]" 
            />
            
            {/* Text Overlay - Top Left Aligned */}
            <div className="absolute inset-0 z-10 p-5 md:p-6 flex flex-col items-start bg-gradient-to-b from-white/15 via-transparent to-transparent">
              <h3 className="text-[32px] md:text-[38px] font-medium leading-[1.1] tracking-tight text-black mb-1">{cat.label}</h3>
              <p className="text-[12px] font-bold uppercase tracking-wider text-black mb-1">{cat.name}</p>
              {cat.subtext && (
                <p className="text-[11px] text-gray-800 font-normal leading-tight max-w-[180px]">
                  {cat.subtext}
                </p>
              )}
            </div>
            
            {/* Border effect on hover */}
            <div className="absolute inset-0 border-0 group-hover/card:border-1 border-gray-200/50 pointer-events-none"></div>
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
