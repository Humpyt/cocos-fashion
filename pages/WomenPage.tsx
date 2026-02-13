
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';
import { getImageByIndex } from '../imageStore';

interface Props {
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const WomenPage: React.FC<Props> = ({ onProductClick, onToggleWishlist, onQuickView, wishlist = [] }) => {
  const categories: Category[] = [
    { id: 'w1', name: 'Dresses', imageUrl: getImageByIndex(11) },
    { id: 'w2', name: 'Coats', imageUrl: getImageByIndex(12) },
    { id: 'w3', name: 'Shoes', imageUrl: getImageByIndex(13) },
    { id: 'w4', name: 'Handbags', imageUrl: getImageByIndex(14) },
    { id: 'w5', name: 'Activewear', imageUrl: getImageByIndex(15) },
    { id: 'w6', name: 'Jewelry', imageUrl: getImageByIndex(16) },
  ];

  const deals: Category[] = [
    { id: 'd1', name: 'CLOTHING', label: '30-50% OFF', subtext: 'Fresh arrivals in every fit.', imageUrl: getImageByIndex(17) },
    { id: 'd2', name: 'SHOES', label: 'UP TO 40% OFF', subtext: 'Boots, heels & sneakers.', imageUrl: getImageByIndex(18) },
    { id: 'd3', name: 'ACCESSORIES', label: 'BUY 1 GET 1 50% OFF', subtext: 'Scarves, hats & more.', imageUrl: getImageByIndex(19) },
  ];

  const products: Product[] = Array(8).fill(null).map((_, i) => ({
    id: `w-prod-${i}`,
    brand: "Free People",
    name: "Women's Dreamy Velvet Midi Dress",
    price: "UGX 245,000",
    originalPrice: "UGX 380,000",
    discount: "(35% off)",
    rating: 4.7,
    reviews: 312,
    imageUrl: getImageByIndex(i + 1),
    badge: "New Arrival",
    colors: ['#4B0082', '#000000', '#8B0000']
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-pink-100 flex items-center justify-center overflow-hidden">
        <img
          src={getImageByIndex(27)}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Women's Fashion"
        />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Spring Starts Here</h2>
          <p className="text-xl font-bold uppercase tracking-widest">30-50% OFF NEW ARRIVALS</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Now</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Exclusive Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Trending Now</h2>
          <ProductSlider
            products={products}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlist={wishlist}
          />
        </div>
      </div>
    </div>
  );
};

export default WomenPage;
