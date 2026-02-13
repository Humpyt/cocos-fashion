
import React, { useState } from 'react';
import { Star, Heart, Share2, Info, ChevronRight, Truck, Store, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { getImageByIndex } from '../imageStore';
import ProductSlider from '../components/ProductSlider';

interface Props {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlist?: Product[];
}

const ProductDetailPage: React.FC<Props> = ({ product, onProductClick, onAddToBag, onToggleWishlist, wishlist = [] }) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(product.imageUrl);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const thumbnails = [
    product.imageUrl,
    getImageByIndex(10),
    getImageByIndex(12),
    getImageByIndex(14)
  ];

  const isInWishlist = wishlist.some(p => p.id === product.id);

  const handleAddToBag = () => {
    if (onAddToBag) {
      onAddToBag(product, quantity, selectedSize, selectedColor);
    }
  };

  return (
    <div className="w-full bg-white pb-20 md:pb-0">
      {/* Breadcrumbs - Scrollable on mobile */}
      <div className="max-w-[1600px] mx-auto px-4 py-4 text-[10px] md:text-[11px] text-gray-500 uppercase font-bold flex items-center gap-1.5 tracking-wider overflow-x-auto whitespace-nowrap hide-scrollbar">
        <span className="hover:text-cocos-orange cursor-pointer shrink-0">Coco's</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="hover:text-cocos-orange cursor-pointer shrink-0">Women</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="hover:text-cocos-orange cursor-pointer shrink-0">{product.brand}</span>
        <ChevronRight size={10} className="shrink-0" />
        <span className="text-black shrink-0">{product.name}</span>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:py-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-[60%] flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails - Horizontal on mobile, Vertical on desktop */}
          <div className="flex md:flex-col gap-3 md:w-20 overflow-x-auto hide-scrollbar md:overflow-visible py-1">
            {thumbnails.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img)}
                className={`w-16 md:w-full aspect-square shrink-0 border p-0.5 transition-all ${mainImage === img ? 'border-cocos-orange' : 'border-gray-200'}`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-grow relative aspect-[4/5] bg-gray-50 overflow-hidden rounded-sm">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            <button
              className={`absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all ${isInWishlist ? 'text-cocos-orange' : 'hover:text-cocos-orange'}`}
              onClick={() => onToggleWishlist?.(product)}
            >
              <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-[40%] flex flex-col px-1 md:px-0">
          <p className="text-xs md:text-[15px] font-black uppercase tracking-widest mb-1 text-cocos-orange">{product.brand}</p>
          <h1 className="text-xl md:text-[22px] font-medium leading-snug mb-4 font-serif-promo">{product.name}</h1>

          {/* Ratings */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-cocos-orange">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-[11px] font-bold underline cursor-pointer">{product.reviews} Reviews</span>
            <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
            <button className="text-[11px] font-bold underline flex items-center gap-1.5"><Share2 size={12} /> Share</button>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl md:text-[28px] font-black text-black">{product.price}</span>
            {product.originalPrice && <span className="text-sm md:text-[16px] text-gray-400 line-through">{product.originalPrice}</span>}
            {product.discount && <span className="text-xs md:text-[16px] text-cocos-orange font-bold uppercase tracking-widest">{product.discount}</span>}
          </div>

          {/* Rewards Offer */}
          <div className="bg-[#fcfbf9] p-4 rounded-sm border-l-4 border-cocos-orange mb-8">
            <p className="text-[12px] font-bold text-black mb-1 flex items-center gap-2">
              <span className="text-cocos-orange">★</span> Get UGX 40,000 Credit
            </p>
            <p className="text-[10px] text-gray-600 leading-relaxed">For every UGX 300,000 spent with Coco's Card. <button className="underline font-bold text-black uppercase ml-1">Learn More</button></p>
          </div>

          {/* Options: Colors & Sizes */}
          <div className="space-y-8 mb-10">
            {product.colors && (
              <div>
                <p className="text-[11px] font-black uppercase mb-3 tracking-widest text-gray-500">Color: <span className="text-black">Selected</span></p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full p-1 border transition-all ${selectedColor === color ? 'border-cocos-orange' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full border border-gray-100 shadow-inner" style={{ backgroundColor: color }}></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">Size: <span className="text-black">{selectedSize || 'Select'}</span></p>
                <button className="text-[10px] font-bold underline uppercase text-gray-400 tracking-wider">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 border text-[12px] font-bold transition-all uppercase tracking-widest ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-cocos-orange'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Mobile Action Bar - UX improvement */}
          <div className="fixed md:static bottom-0 left-0 right-0 bg-white md:bg-transparent border-t md:border-t-0 p-4 md:p-0 z-[40] flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none">
            <div className="hidden sm:flex md:flex w-24 border border-gray-300 items-center">
              <select
                className="w-full h-full px-4 text-xs font-bold bg-white outline-none appearance-none"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <button
              onClick={handleAddToBag}
              className="flex-grow bg-black text-white py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-cocos-orange hover:text-black transition-all shadow-xl"
            >
              Add to Bag
            </button>
          </div>

          {/* Shipping Features */}
          <div className="border-t border-gray-100 py-8 space-y-6">
            <div className="flex gap-4">
              <Truck size={22} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight mb-1">Standard Shipping</p>
                <p className="text-[11px] text-gray-500">Free across Uganda on orders over UGX 500k.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Store size={22} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight mb-1">Pickup in Store</p>
                <p className="text-[11px] text-gray-500">Collect today at Kampala Mall Boutique.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
