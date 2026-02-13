
import React from 'react';
import { Search, Heart, ShoppingBag, MapPin, Gift, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  cartCount?: number;
  wishlistCount?: number;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, cartCount = 0, wishlistCount = 0, user }) => {
  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Utility Nav */}
      <div className="w-full bg-white text-[11px] font-bold border-b border-gray-100 py-1.5 px-4 hidden md:flex justify-between items-center text-[#555]">
        <div className="flex gap-4">
          <a href="#" className="hover:underline">COCO'S UGANDA DEALS</a>
          <a href="#" className="hover:underline">Fashion Week deals</a>
          <a href="#" className="hover:underline">Jewelry sale</a>
          <a href="#" className="hover:underline">Seasonal essentials</a>
          <a href="#" className="hover:underline">Home collection</a>
          <a href="#" className="text-cocos-orange hover:underline">See All ></a>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:underline flex items-center gap-1.5"><MapPin size={13} /> Kampala Store</a>
          <a href="#" className="hover:underline flex items-center gap-1.5"><Gift size={13} /> Gift Registry</a>
          <button onClick={() => onNavigate('cart')} className="hover:underline flex items-center gap-1.5 uppercase">
            <ShoppingBag size={13} /> {cartCount}
          </button>
        </div>
      </div>

      {/* Main Branding & Search */}
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-5 px-4 gap-8">
        {/* Coco's Logo - Recreated with SVG for accuracy */}
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
               <defs>
                 <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" style={{ stopColor: '#FF9500', stopOpacity: 1 }} />
                   <stop offset="100%" style={{ stopColor: '#FF7D00', stopOpacity: 1 }} />
                 </linearGradient>
               </defs>
               <path 
                 fill="url(#starGradient)" 
                 d="M50 5L61.8 38.2H95L68.2 57.8L80 91L50 71.4L20 91L31.8 57.8L5 38.2H38.2L50 5Z" 
               />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-[38px] font-black tracking-tighter text-black font-serif-promo flex items-baseline">
              COCO<span className="text-cocos-orange text-[24px] mx-0.5 mt-[-10px]">★</span>S
            </h1>
            <span className="text-[14px] font-black tracking-[0.2em] text-cocos-orange uppercase mt-[-4px]">FASHION BRANDS UG</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Search Coco's Fashion Brands..." 
            className="w-full bg-[#f1f1f1] border-none rounded-sm px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-cocos-orange transition-all"
          />
          <Search className="absolute right-4 top-3 text-gray-400" size={20} />
        </div>

        {/* Account Actions */}
        <div className="flex items-center gap-6">
            <div className="text-[11px] text-gray-600 hidden lg:block leading-tight text-right">
                {user ? `Hi, ${user.firstName}` : 'Discover'}<br/>
                <span className="font-bold text-black uppercase">Your Style</span>
            </div>
            
            {user ? (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-sm hover:bg-gray-200 transition-colors border border-gray-200"
              >
                <UserIcon size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Account</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-black text-white text-xs font-bold px-8 py-3.5 rounded-sm hover:bg-gray-800 transition-colors uppercase tracking-widest shadow-sm"
              >
                Sign In
              </button>
            )}

            <div className="flex items-center gap-5 text-gray-700">
                <div 
                  className="flex flex-col items-center group cursor-pointer relative"
                  onClick={() => onNavigate('wishlist')}
                >
                    <div className="relative">
                      <Heart size={28} className={`${currentPage === 'wishlist' ? 'text-cocos-orange fill-cocos-orange' : 'group-hover:text-cocos-orange'} transition-colors`} />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-cocos-orange text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold mt-1 uppercase">Wish</span>
                </div>

                <div 
                  className="flex flex-col items-center group cursor-pointer relative"
                  onClick={() => onNavigate('cart')}
                >
                    <div className="relative">
                      <ShoppingBag size={28} className={`${currentPage === 'cart' ? 'text-cocos-orange fill-cocos-orange' : 'group-hover:text-black'} transition-colors`} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-cocos-orange text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold mt-1 uppercase">Bag</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Categories Nav */}
      <nav className="w-full border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto flex items-center px-4 py-3 text-[12px] font-bold overflow-x-auto hide-scrollbar">
            <div className="flex gap-8 items-center whitespace-nowrap">
                <button 
                  onClick={() => onNavigate('home')}
                  className={`flex items-center gap-1 uppercase pb-1 border-b-2 transition-all ${currentPage === 'home' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                >
                  Shop All
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button 
                  onClick={() => onNavigate('women')}
                  className={`uppercase transition-all pb-1 border-b-2 ${currentPage === 'women' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                >
                  Women
                </button>
                <button 
                  onClick={() => onNavigate('men')}
                  className={`uppercase transition-all pb-1 border-b-2 ${currentPage === 'men' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                >
                  Men
                </button>
                <button 
                  onClick={() => onNavigate('shoes')}
                  className={`uppercase transition-all pb-1 border-b-2 ${currentPage === 'shoes' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                >
                  Shoes
                </button>
                <button 
                  onClick={() => onNavigate('handbags')}
                  className={`uppercase transition-all pb-1 border-b-2 ${currentPage === 'handbags' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                >
                  Handbags
                </button>
                <button className="uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 border-transparent">Gifts</button>
                <button className="uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 border-transparent">Now & Trending</button>
                <button className="uppercase text-cocos-orange font-black hover:underline pb-1 border-b-2 border-transparent">Sale</button>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
