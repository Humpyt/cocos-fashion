
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';

interface Props {
  products: Product[];
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
  wishlist?: Product[];
}

const FALLBACK_PRODUCT_IMAGE = '/women.jpg';

const ProductSlider: React.FC<Props> = ({
  products,
  onProductClick,
  onToggleWishlist,
  onQuickView,
  onAddToBag,
  wishlist = [],
}) => {
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

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  return (
    <div className="relative group/slider px-2">
      <div
        ref={scrollRef}
        className="flex gap-[32px] overflow-x-auto hide-scrollbar snap-x pb-12 pt-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[260px] md:min-w-[320px] snap-start bg-white cursor-pointer group/item flex flex-col"
            onClick={() => onProductClick?.(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onProductClick?.(product);
              }
            }}
            aria-label={`Open product details for ${product.name}`}
          >
            {/* Visual Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F8F8] rounded-none mb-6">
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.dataset.fallbackApplied === '1') {
                    return;
                  }
                  target.dataset.fallbackApplied = '1';
                  target.src = FALLBACK_PRODUCT_IMAGE;
                }}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/item:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
              />

              {/* Interaction Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 motion-reduce:transition-none"></div>

              {/* Action Buttons */}
              <div className="absolute top-5 right-5 z-10 flex flex-col gap-3 translate-x-0 opacity-100 md:translate-x-12 md:opacity-0 md:group-hover/item:translate-x-0 md:group-hover/item:opacity-100 transition-all duration-500 motion-reduce:transition-none">
                <button
                  aria-label={`Toggle wishlist for ${product.name}`}
                  className={`w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 ${isInWishlist(product.id) ? 'text-cocos-orange' : 'text-black hover:text-cocos-orange'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist?.(product);
                  }}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
                <button
                  aria-label={`Quick view ${product.name}`}
                  className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-2xl hover:bg-cocos-orange hover:text-white transition-all transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onQuickView) {
                      onQuickView(product);
                    } else {
                      onProductClick?.(product);
                    }
                  }}
                >
                  <Eye size={20} className="text-black group-hover:text-inherit" />
                </button>
              </div>

              {/* Status Badge */}
              {product.badge && (
                <div className="absolute top-5 left-0 bg-cocos-orange text-white text-[10px] font-black px-4 py-2 uppercase tracking-[0.2em] shadow-lg">
                  {product.badge}
                </div>
              )}

              {/* Quick Add Bar */}
              <div className="absolute inset-x-0 bottom-0 translate-y-0 md:translate-y-full md:group-hover/item:translate-y-0 transition-transform duration-300 bg-black/95 md:bg-black p-4 flex justify-center motion-reduce:transition-none">
                <button
                  aria-label={`Quick add ${product.name}`}
                  className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:text-cocos-orange transition-colors"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (product.variantId && onAddToBag) {
                      onAddToBag(product, 1);
                      return;
                    }
                    if (onQuickView) {
                      onQuickView(product);
                      return;
                    }
                    onProductClick?.(product);
                  }}
                >
                  <ShoppingBag size={14} /> Quick Add
                </button>
              </div>
            </div>

            {/* Typography & Details */}
            <div className="flex flex-col flex-grow px-1">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">{product.brand}</span>
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-sm">
                  <Star size={12} fill="#FF7D00" className="text-cocos-orange" />
                  <span className="text-[11px] font-black">{product.rating}</span>
                </div>
              </div>

              <h3 className="font-serif-promo text-[18px] md:text-[22px] text-black font-medium leading-[1.2] mb-4 line-clamp-1 group-hover/item:text-cocos-orange transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-cocos-orange font-black text-[22px] tracking-tighter">{product.price}</span>
                {product.discount && (
                  <span className="text-gray-400 text-[14px] line-through font-medium">{product.originalPrice}</span>
                )}
                {product.discount && (
                  <span className="text-cocos-orange text-[12px] font-black uppercase tracking-widest">{product.discount}</span>
                )}
              </div>

              {/* Star Rewards Interactive Bar */}
              <div className="mt-auto border-t border-gray-100 pt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <p className="text-[11px] font-bold text-[#0046BE] uppercase tracking-wider">
                    UGX 40,000 Rewards
                  </p>
                </div>
                <span className="text-[11px] text-gray-400 font-bold">({product.reviews})</span>
              </div>

              {/* Color Swatches Grid */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-2.5 mt-5">
                  {product.colors.slice(0, 5).map((color, idx) => (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-full p-[2px] transition-all ring-offset-2 ${idx === 0 ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-gray-300'}`}
                    >
                      <div
                        className="w-full h-full rounded-full border border-gray-100 shadow-inner"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  ))}
                  {product.colors.length > 5 && (
                    <span className="text-[10px] font-black text-gray-400 ml-1">+{product.colors.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modern Slider Navigation */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll products left"
          className="absolute -left-8 top-[38%] -translate-y-1/2 bg-white w-16 h-16 rounded-full shadow-2xl border border-gray-100 flex items-center justify-center z-20 hover:scale-110 hover:bg-cocos-orange hover:text-white transition-all duration-500 group/nav"
        >
          <ChevronLeft size={32} className="transition-transform group-hover/nav:-translate-x-1" />
        </button>
      )}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll products right"
          className="absolute -right-8 top-[38%] -translate-y-1/2 bg-white w-16 h-16 rounded-full shadow-2xl border border-gray-100 flex items-center justify-center z-20 hover:scale-110 hover:bg-cocos-orange hover:text-white transition-all duration-500 group/nav"
        >
          <ChevronRight size={32} className="transition-transform group-hover/nav:translate-x-1" />
        </button>
      )}
    </div>
  );
};

export default ProductSlider;
