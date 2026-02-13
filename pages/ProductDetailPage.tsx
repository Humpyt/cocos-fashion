
import React, { useState } from 'react';
import { Star, Heart, Share2, Info, ChevronRight, Truck, Store, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
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
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400"
  ];

  const isInWishlist = wishlist.some(p => p.id === product.id);

  const recommendations: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `rec-${i}`,
    brand: product.brand,
    name: `Similar ${product.brand} Item ${i + 1}`,
    price: "UGX 120,000",
    discount: "(25% off)",
    rating: 4.5,
    reviews: 120,
    imageUrl: `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=500&seed=rec-${i}`,
    colors: product.colors
  }));

  const handleAddToBag = () => {
    if (onAddToBag) {
      onAddToBag(product, quantity, selectedSize, selectedColor);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 text-[11px] text-gray-500 uppercase font-bold flex items-center gap-1.5 tracking-wider">
        <span className="hover:text-cocos-orange cursor-pointer">Coco's</span>
        <ChevronRight size={10} />
        <span className="hover:text-cocos-orange cursor-pointer">Women</span>
        <ChevronRight size={10} />
        <span className="hover:text-cocos-orange cursor-pointer">{product.brand}</span>
        <ChevronRight size={10} />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-12">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-[60%] flex gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 w-20 flex-shrink-0">
            {thumbnails.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setMainImage(img)}
                className={`aspect-square border p-1 ${mainImage === img ? 'border-cocos-orange' : 'border-gray-200'} transition-all`}
              >
                <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-grow relative aspect-[4/5] bg-gray-50 group overflow-hidden">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            <button 
              className={`absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transition-all ${isInWishlist ? 'text-cocos-orange' : 'hover:text-cocos-orange'}`}
              onClick={() => onToggleWishlist?.(product)}
            >
              <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-[40%] flex flex-col">
          <p className="text-[15px] font-black uppercase tracking-tight mb-1 text-cocos-orange">{product.brand}</p>
          <h1 className="text-[22px] font-medium leading-snug mb-4">{product.name}</h1>

          {/* Ratings */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-cocos-orange">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-[12px] font-bold underline cursor-pointer">{product.reviews} Reviews</span>
            <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
            <button className="text-[12px] font-bold underline flex items-center gap-1.5"><Share2 size={14} /> Share</button>
          </div>

          {/* Price */}
          <div className="flex flex-col mb-6">
             <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-black text-black">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-[16px] text-gray-400 line-through">{product.originalPrice}</span>
                )}
                {product.discount && (
                  <span className="text-[16px] text-cocos-orange font-bold">{product.discount}</span>
                )}
             </div>
             <p className="text-[12px] font-bold text-gray-500 mt-1 uppercase tracking-wider">Sale ends soon</p>
          </div>

          {/* Rewards Offer */}
          <div className="bg-stone-50 p-4 rounded-sm border-l-4 border-cocos-orange mb-8 shadow-sm">
            <div className="flex gap-3">
              <div className="text-cocos-orange font-bold text-xl">★</div>
              <div>
                <p className="text-[13px] font-bold text-black mb-0.5">Get UGX 40,000 Credit for UGX 300,000</p>
                <p className="text-[11px] text-gray-700">spent with your Coco's Style Card. Earn points twice as fast in Uganda!</p>
                <button className="text-[11px] font-bold underline mt-1.5 text-cocos-orange uppercase tracking-wider">Details</button>
              </div>
            </div>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <p className="text-[13px] font-bold uppercase mb-3 tracking-widest">Color: <span className="text-gray-500 ml-1 font-normal">Selection</span></p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full p-[2px] border ${selectedColor === color ? 'border-cocos-orange' : 'border-transparent'}`}
                  >
                    <div className="w-full h-full rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color }}></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[13px] font-bold uppercase tracking-widest">Size: <span className="text-gray-500 ml-1 font-normal">{selectedSize || 'Select Size'}</span></p>
              <button className="text-[11px] font-bold underline uppercase tracking-wider text-gray-500">Size Chart</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[50px] h-10 border text-[13px] font-bold transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-cocos-orange'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Bag */}
          <div className="flex gap-4 mb-10">
            <div className="w-24 border border-gray-300 flex items-center">
              <select 
                className="w-full h-full px-4 text-sm font-bold bg-white outline-none appearance-none cursor-pointer"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>Qty: {q}</option>)}
              </select>
            </div>
            <button 
              onClick={handleAddToBag}
              className="flex-grow bg-black text-white py-4 font-black uppercase text-sm tracking-widest hover:bg-cocos-orange hover:text-black transition-colors shadow-lg"
            >
              Add to Bag
            </button>
          </div>

          {/* Shipping / Pickup Options */}
          <div className="border-t border-b border-gray-100 py-6 mb-8">
            <div className="flex gap-4 mb-6">
              <div className="pt-1"><Truck size={20} className="text-cocos-orange" /></div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight mb-0.5">Premium Free Shipping</p>
                <p className="text-[12px] text-gray-500">Delivery within 2-3 business days across Uganda.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="pt-1"><Store size={20} className="text-cocos-orange" /></div>
              <div>
                <p className="text-[13px] font-black uppercase tracking-tight mb-0.5">Quick Pickup</p>
                <p className="text-[12px] text-gray-500">Ready in 2 hours at our Kampala Boutique.</p>
                <button className="text-[11px] font-bold underline mt-1 text-cocos-orange uppercase tracking-wider">Change Store</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
