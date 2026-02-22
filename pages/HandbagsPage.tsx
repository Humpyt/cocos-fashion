
import React from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';
import { getImageByIndex } from '../imageStore';

interface Props {
  apiProducts?: Product[];
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const HandbagsPage: React.FC<Props> = ({ apiProducts = [], onProductClick, onToggleWishlist, onQuickView, wishlist = [] }) => {
  const categories: Category[] = [
    { id: 'h1', name: 'Totes', imageUrl: getImageByIndex(61) },
    { id: 'h2', name: 'Crossbody', imageUrl: getImageByIndex(62) },
    { id: 'h3', name: 'Shoulder Bags', imageUrl: getImageByIndex(63) },
    { id: 'h4', name: 'Satchels', imageUrl: getImageByIndex(64) },
    { id: 'h5', name: 'Backpacks', imageUrl: getImageByIndex(65) },
    { id: 'h6', name: 'Clutches', imageUrl: getImageByIndex(66) },
  ];

  const deals: Category[] = [
    { id: 'hd1', name: 'DESIGNER', label: 'STARTING AT $129', subtext: 'Coach, Michael Kors & Kate Spade.', imageUrl: getImageByIndex(67) },
    { id: 'hd2', name: 'TRAVEL', label: 'UP TO 40% OFF', subtext: 'Luggage & weekenders for your next trip.', imageUrl: getImageByIndex(68) },
    { id: 'hd3', name: 'WALLETS', label: 'BUY 1 GET 1 FREE', subtext: 'Small leather goods to match.', imageUrl: getImageByIndex(69) },
  ];

  const products = apiProducts
    .filter((item) => item.categorySlugs?.includes('handbags'))
    .slice(0, 6);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-amber-50 flex items-center justify-center overflow-hidden">
        <img
          src={getImageByIndex(79)}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          alt="Handbags Collection"
        />
        <div className="relative z-10 text-center text-white drop-shadow-2xl">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">The Designer Event</h2>
          <p className="text-xl font-bold uppercase tracking-widest">LUXURY HANDBAGS STARTING AT $149</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Designer</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Silhouette</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Handbag Hot Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Bestsellers</h2>
          {products.length ? (
            <ProductSlider
              products={products}
              onProductClick={onProductClick}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              wishlist={wishlist}
            />
          ) : (
            <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
              No products available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandbagsPage;
