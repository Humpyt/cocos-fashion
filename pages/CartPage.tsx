
import React from 'react';
import { Trash2, Heart, ChevronRight, Info, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, Product } from '../types';
import ProductSlider from '../components/ProductSlider';

interface Props {
  cart: CartItem[];
  onRemove: (id: string, size?: string, color?: string) => void;
  onUpdateQuantity: (id: string, quantity: number, size?: string, color?: string) => void;
  onProductClick: (product: Product) => void;
  onNavigate: (page: string) => void;
}

const CartPage: React.FC<Props> = ({ cart, onRemove, onUpdateQuantity, onProductClick, onNavigate }) => {
  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + price * item.quantity;
  }, 0);

  const recommendations: Product[] = Array(6).fill(null).map((_, i) => ({
    id: `cart-rec-${i}`,
    brand: "Calvin Klein",
    name: "Complete Your Look Item",
    price: "$59.99",
    discount: "(20% off)",
    rating: 4.5,
    reviews: 88,
    imageUrl: `https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=400&h=500&seed=cart-rec-${i}`,
  }));

  if (cart.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tight">Your bag is empty</h1>
        <p className="text-gray-500 mb-10">Start shopping and discover something new today.</p>
        <button 
          onClick={() => onNavigate('home')}
          className="bg-cocos-orange text-white px-12 py-4 font-black uppercase text-sm tracking-widest hover:bg-black transition-colors"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="text-[32px] font-black uppercase mb-8 tracking-tighter">Your Shopping Bag</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Cart Items */}
          <div className="flex-grow">
            <div className="bg-white border border-gray-200">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <h2 className="text-sm font-bold uppercase tracking-wider">Ship to Me <span className="text-gray-400 font-normal ml-2">({cart.length} items)</span></h2>
                 <span className="text-[11px] font-bold text-cocos-orange uppercase cursor-pointer hover:underline">Shipping Details</span>
              </div>

              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className={`p-6 flex gap-6 ${idx !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}>
                   {/* Product Image */}
                   <div 
                    className="w-32 h-40 bg-gray-50 flex-shrink-0 cursor-pointer overflow-hidden"
                    onClick={() => onProductClick(item)}
                   >
                     <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                   </div>

                   {/* Product Info */}
                   <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[13px] font-black uppercase tracking-tight">{item.brand}</p>
                        <p className="text-[16px] font-black">{item.price}</p>
                      </div>
                      <h3 
                        className="text-[14px] font-medium leading-snug mb-3 max-w-md cursor-pointer hover:text-cocos-orange"
                        onClick={() => onProductClick(item)}
                      >
                        {item.name}
                      </h3>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-500 mb-6">
                        {item.selectedColor && <span>Color: <span className="text-black font-bold uppercase">{item.selectedColor}</span></span>}
                        {item.selectedSize && <span>Size: <span className="text-black font-bold uppercase">{item.selectedSize}</span></span>}
                        <div className="flex items-center gap-2">
                           Qty: 
                           <select 
                            className="bg-transparent font-bold text-black border-none outline-none cursor-pointer p-0"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value), item.selectedSize, item.selectedColor)}
                           >
                             {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                           </select>
                        </div>
                      </div>

                      <div className="flex gap-6 mt-auto pt-2">
                        <button 
                          onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)}
                          className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-gray-500 hover:text-cocos-orange"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                        <button className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-gray-500 hover:text-black">
                          <Heart size={14} /> Save for later
                        </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Delivery Message */}
            <div className="mt-6 bg-white border border-gray-200 p-6 flex items-center gap-4">
               <Truck className="text-gray-400" />
               <p className="text-[13px]">
                 <span className="font-bold">Shipping to 10001:</span> Your items will arrive by <span className="font-bold">Thursday, Feb 20</span>.
               </p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-white border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-black uppercase mb-6 tracking-tighter">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 text-[14px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1.5">
                    Shipping <Info size={14} className="text-gray-400" />
                  </div>
                  <span className="text-green-600 font-bold uppercase">Free</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-1.5">
                    Estimated Tax <Info size={14} className="text-gray-400" />
                  </div>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter">Order Total</span>
                <span className="text-xl font-black">${subtotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => onNavigate('checkout')}
                className="w-full bg-cocos-orange text-white py-4 font-black uppercase text-sm tracking-widest hover:bg-black transition-colors shadow-lg shadow-cocos-orange/20 mb-4"
              >
                Proceed to Checkout
              </button>
              
              <button className="w-full bg-white border border-black text-black py-4 font-black uppercase text-sm tracking-widest hover:bg-gray-50 transition-colors">
                PayPal Checkout
              </button>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-[12px] text-gray-600">
                   <ShieldCheck className="text-green-600" size={24} />
                   <div>
                     <p className="font-bold text-black uppercase">Safe & Secure Shopping</p>
                     <p>Your data is protected with 128-bit encryption.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <section className="max-w-[1400px] mx-auto px-4 py-20 mt-10">
        <h2 className="text-2xl font-bold mb-10 text-center md:text-left">Complete your look</h2>
        <ProductSlider products={recommendations} onProductClick={onProductClick} />
      </section>
    </div>
  );
};

export default CartPage;
