
import React from 'react';
import { Product } from '../types';
import ProductSlider from '../components/ProductSlider';
import { getImageByIndex } from '../imageStore';

interface Props {
  apiProducts?: Product[];
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const ShoesPage: React.FC<Props> = ({ apiProducts = [], onProductClick, onToggleWishlist, onQuickView, wishlist = [] }) => {
  const products = apiProducts
    .filter((item) => item.categorySlugs?.includes('shoes'))
    .slice(0, 6);

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

export default ShoesPage;
