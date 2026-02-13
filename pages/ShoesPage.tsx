
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

const ShoesPage: React.FC<Props> = ({ onProductClick, onToggleWishlist, onQuickView, wishlist = [] }) => {
  const categories: Category[] = [
    { id: 's1', name: 'Boots', imageUrl: getImageByIndex(51) },
    { id: 's2', name: 'Sneakers', imageUrl: getImageByIndex(52) },
    { id: 's3', name: 'Heels', imageUrl: getImageByIndex(53) },
    { id: 's4', name: 'Sandals', imageUrl: getImageByIndex(54) },
    { id: 's5', name: 'Athletic', imageUrl: getImageByIndex(55) },
    { id: 's6', name: 'Loafers', imageUrl: getImageByIndex(56) },
  ];

  const deals: Category[] = [
    { id: 'sd1', name: 'ATHLETIC', label: '25-40% OFF', subtext: 'Nike, Adidas & more top brands.', imageUrl: getImageByIndex(57) },
    { id: 'sd2', name: 'BOOTS', label: '40-60% OFF', subtext: 'Clearance on winter styles.', imageUrl: getImageByIndex(58) },
    { id: 'sd3', name: 'LUXURY', label: '20% OFF', subtext: 'Designer shoes that shine.', imageUrl: getImageByIndex(59) },
  ];

  const products: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `s-prod-${i}`,
    brand: "Steve Madden",
    name: "Women's Viable Pointed-Toe Booties",
    price: "UGX 320,000",
    originalPrice: "UGX 450,000",
    discount: "(39% off)",
    rating: 4.5,
    reviews: 512,
    imageUrl: getImageByIndex(i + 41),
    badge: "Limited Time"
  }));

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-stone-100 flex items-center justify-center overflow-hidden">
        <img
          src={getImageByIndex(67)}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Shoes Collection"
        />
        <div className="relative z-10 text-center text-white drop-shadow-xl">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Step Into Style</h2>
          <p className="text-xl font-bold uppercase tracking-widest">BOOTS & SNEAKERS UP TO 50% OFF</p>
          <button className="mt-8 bg-black text-white px-12 py-3 font-bold uppercase hover:bg-gray-800 transition-colors">Shop Clearance</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Style</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Shoe Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Bestsellers</h2>
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

export default ShoesPage;
