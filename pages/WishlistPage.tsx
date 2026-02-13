
import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { Product } from '../types';

interface Props {
  wishlist: Product[];
  onProductClick: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onNavigate: (page: string) => void;
  onQuickView?: (product: Product) => void;
}

const WishlistPage: React.FC<Props> = ({ wishlist, onProductClick, onToggleWishlist, onNavigate, onQuickView }) => {
  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-20">
      <div className="max-w-[1600px] mx-auto px-4 py-12">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-sm font-bold uppercase hover:text-cocos-orange mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Shopping
        </button>

        <div className="flex items-baseline gap-4 mb-12">
          <h1 className="text-[44px] font-black uppercase tracking-tighter font-serif-promo italic leading-none">Your Wishlist</h1>
          <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">({wishlist.length} saved items)</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-stone-50 flex items-center justify-center mb-6">
              <Heart size={48} className="text-gray-200" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">No saved items yet</h2>
            <p className="text-gray-500 mb-10 max-w-md">Items added to your wishlist will show up here. Save your favorites to buy them later!</p>
            <button
              onClick={() => onNavigate('home')}
              className="bg-cocos-orange text-white px-12 py-4 font-black uppercase text-sm tracking-widest hover:bg-black transition-colors"
            >
              Start Exploring
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 group relative">
                <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
                  <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                  <button
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-cocos-orange hover:text-white transition-all z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-cocos-orange hover:text-white transition-all opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView?.(product);
                    }}
                  >
                    <Eye size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>
                  <h3 className="font-serif-promo text-lg font-medium leading-tight mb-3 line-clamp-1 hover:text-cocos-orange cursor-pointer" onClick={() => onProductClick(product)}>
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl font-black text-black">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onProductClick(product)}
                    className="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cocos-orange hover:text-black transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} /> Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
