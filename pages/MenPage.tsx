
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

const MenPage: React.FC<Props> = ({ apiProducts = [], onProductClick, onToggleWishlist, onQuickView, wishlist = [] }) => {
  const categories: Category[] = [
    { id: 'm1', name: 'Shirts', imageUrl: getImageByIndex(31) },
    { id: 'm2', name: 'Suits', imageUrl: getImageByIndex(32) },
    { id: 'm3', name: 'Shoes', imageUrl: getImageByIndex(33) },
    { id: 'm4', name: 'Watches', imageUrl: getImageByIndex(34) },
    { id: 'm5', name: 'Activewear', imageUrl: getImageByIndex(35) },
    { id: 'm6', name: 'Denim', imageUrl: getImageByIndex(36) },
  ];

  const deals: Category[] = [
    { id: 'md1', name: 'SUITING', label: '40-60% OFF', subtext: 'Look sharp for any occasion.', imageUrl: getImageByIndex(37) },
    { id: 'md2', name: 'BOOTS', label: 'UP TO 50% OFF', subtext: 'Rugged styles for everyday.', imageUrl: getImageByIndex(38) },
    { id: 'md3', name: 'ACTIVE', label: 'Starting UGX 45,000', subtext: 'Moisture-wicking essentials.', imageUrl: getImageByIndex(39) },
  ];

  const products = apiProducts
    .filter((item) => item.categorySlugs?.includes('men'))
    .slice(0, 6);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-blue-900 flex items-center justify-center overflow-hidden">
        <img
          src={getImageByIndex(47)}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          alt="Men's Fashion"
        />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Master the Season</h2>
          <p className="text-xl font-bold uppercase tracking-widest">DESIGNER SUITING & SHOES 40-60% OFF</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Suiting</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Best Men's Deals</h2>
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

export default MenPage;
