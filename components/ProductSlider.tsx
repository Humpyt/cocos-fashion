
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onProductClick?: (product: Product) => void;
}

const ProductSlider: React.FC<Props> = ({ products, onProductClick }) => {
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
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      <div 
        ref={scrollRef}
        className="flex gap-[22px] overflow-x-auto hide-scrollbar snap-x pb-4"
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[200px] md:min-w-[260px] snap-start bg-white cursor-pointer group/item"
            onClick={() => onProductClick?.(product)}
          >
            <div className="relative aspect-square overflow-hidden bg-[#F9F9F9] mb-3">
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-[1.03]" />
              
              {/* Heart Icon Button */}
              <button 
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Heart size={16} className="text-black" />
              </button>

              {product.badge && (
                <div className="absolute bottom-0 left-0 bg-cocos-orange text-white text-[9px] font-bold px-2 py-0.5 uppercase">
                  {product.badge}
                </div>
              )}
            </div>
            
            <div className="px-0.5">
              <p className="text-[13px] font-bold mb-0.5 tracking-tight">{product.brand}</p>
              <h3 className="text-[14px] text-black font-medium line-clamp-2 mb-1.5 h-10 leading-snug">{product.name}</h3>
              
              <div className="flex items-baseline gap-1.5 mb-1 mt-2">
                <span className="text-cocos-orange font-bold text-[15px]">{product.price}</span>
                {product.discount && (
                  <span className="text-cocos-orange text-[12px] font-normal">{product.discount}</span>
                )}
              </div>

              <p className="text-[12px] text-[#0046BE] font-medium mb-2 leading-none">$10 Star Rewards for $100</p>
              
              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 mb-3">
                  {product.colors.map((color, idx) => (
                    <div 
                      key={idx} 
                      className={`w-7 h-7 rounded-full p-[1px] flex items-center justify-center ${idx === 0 ? 'border border-black' : 'border border-transparent'}`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-gray-300" 
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 mt-1">
                <div className="flex text-cocos-orange">
                   {[...Array(5)].map((_, i) => (
                     <Star key={i} size={11} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                   ))}
                </div>
                <span className="text-[10px] text-gray-400 font-bold">({product.reviews})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLeft && (
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-6 top-[35%] -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
      )}
      {showRight && (
        <button 
          onClick={() => scroll('right')}
          className="absolute -right-6 top-[35%] -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all"
        >
          <ChevronRight size={24} className="text-black" />
        </button>
      )}
    </div>
  );
};

export default ProductSlider;
