
import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, Share2, Info } from 'lucide-react';
import { Product } from '../types';

interface Props {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
    onToggleWishlist?: (product: Product) => void;
    wishlist?: Product[];
}

const QuickViewModal: React.FC<Props> = ({
    product,
    isOpen,
    onClose,
    onAddToBag,
    onToggleWishlist,
    wishlist = []
}) => {
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const isInWishlist = wishlist.some(p => p.id === product.id);

    const handleAddToBag = () => {
        if (onAddToBag) {
            onAddToBag(product, quantity, selectedSize, selectedColor);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-500 animate-in fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full text-black md:text-white hover:bg-cocos-orange hover:text-white transition-all shadow-lg"
                >
                    <X size={24} />
                </button>

                {/* Left: Image Section */}
                <div className="w-full md:w-1/2 h-[350px] md:h-auto relative overflow-hidden bg-gray-50">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110"
                    />
                    {product.badge && (
                        <div className="absolute top-6 left-0 bg-cocos-orange text-white text-[10px] font-black px-5 py-2 uppercase tracking-[0.2em] shadow-xl">
                            {product.badge}
                        </div>
                    )}
                </div>

                {/* Right: Info Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto hide-scrollbar flex flex-col">
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-cocos-orange text-[10px] font-black tracking-[0.4em] uppercase">{product.brand}</span>
                            <div className="flex items-center gap-1 text-black">
                                <Star size={12} fill="currentColor" />
                                <span className="text-[11px] font-black">{product.rating}</span>
                                <span className="text-gray-400 text-[10px] font-bold">({product.reviews})</span>
                            </div>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase font-serif-promo mb-4 leading-tight">
                            {product.name}
                        </h2>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-black text-black">{product.price}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-gray-400 line-through font-bold">{product.originalPrice}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8 mb-10 flex-grow">
                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Color Selection</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all p-1 ${selectedColor === color ? 'border-cocos-orange' : 'border-transparent'}`}
                                        >
                                            <div className="w-full h-full rounded-full" style={{ backgroundColor: color }}></div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Size</label>
                                <button className="text-[10px] font-black underline uppercase tracking-widest hover:text-cocos-orange transition-colors">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-3 text-xs font-black transition-all border-2 ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100 hover:border-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToBag}
                                className="flex-grow bg-black text-white py-5 font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-cocos-orange transition-all active:scale-95 shadow-2xl"
                            >
                                <ShoppingBag size={18} />
                                Add to Bag
                            </button>
                            <button
                                onClick={() => product && onToggleWishlist?.(product)}
                                className={`w-[68px] border-2 flex items-center justify-center transition-all hover:border-cocos-orange ${isInWishlist ? 'border-cocos-orange text-cocos-orange' : 'border-gray-100 text-black'}`}
                            >
                                <Heart size={22} fill={isInWishlist ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <div className="flex justify-center gap-8 py-4 border-t border-gray-100 mt-4">
                            <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 hover:text-black transition-colors"><Share2 size={12} /> Share</button>
                            <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-gray-400 hover:text-black transition-colors"><Info size={12} /> Details</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
