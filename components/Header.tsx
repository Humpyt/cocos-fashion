
import React from 'react';
import { Search, Heart, ShoppingBag, MapPin, Gift, User as UserIcon, Star } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  cartCount?: number;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, cartCount = 0, user }) => {
  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200">
      {/* Top Utility Nav */}
      <div className="w-full bg-white text-[11px] font-bold border-b border-gray-100 py-1.5 px-4 hidden md:flex justify-between items-center text-[#555]">
        <div className="flex gap-4">
          <a href="#" className="hover:underline">COCO'S DAILY DEALS</a>
          <a href="#" className="hover:underline">Up to 60% off Fashion Week deals</a>
          <a href="#" className="hover:underline">Up to 70% off jewelry sale</a>
          <a href="#" className="hover:underline">30-50% off seasonal essentials</a>
          <a href="#" className="hover:underline">Up to 65% off home collection</a>
          <a href="#" className="text-cocos-orange hover:underline">See All ></a>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:underline flex items-center gap-1.5"><MapPin size={13} /> Your Store</a>
          <a href="#" className="hover:underline flex items-center gap-1.5"><Gift size={13} /> Gift Registry</a>
          <button onClick={() => onNavigate('cart')} className="hover:underline flex items-center gap-1.5 uppercase">
            <ShoppingBag size={13} /> {cartCount}
          </button>
        </div>
      </div>

      {/* Main Branding & Search */}
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-5 px-4 gap-8">
        {/* New Coco's Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="relative">
             <Star className="text-cocos-orange fill-cocos-orange" size={44} />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="text-[34px] font-black tracking-tight text-black font-serif-promo">
              COCO<span className="text-cocos-orange">*</span>S
            </h1>
            <span className="text-[12px] font-black tracking-[0.15em] text-cocos-orange uppercase">FASHION BRANDS</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Search Coco's Fashion Brands..." 
            className="w-full bg-[#f1f1f1] border-none rounded-sm px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>

        {/* Account Actions */}
        <div className="flex items-center gap-6">
            <div className="text-[11px] text-gray-600 hidden lg:block leading-tight">
                {user ? `Welcome back,` : 'Discover'}<br/>
                {user ? user.firstName : 'your style'}
            </div>
            
            {user ? (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-sm hover:bg-gray-200 transition-colors"
              >
                <UserIcon size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Account</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="bg-black text-white text-xs font-bold px-7 py-3 rounded-sm hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            )}

            <div className="flex items-center gap-5 text-gray-700">
                <Heart size={26} className="cursor-pointer hover:text-cocos-orange transition-colors" />
                <div 
                  className="flex flex-col items-center group cursor-pointer relative"
                  onClick={() => onNavigate('cart')}
                >
                    <div className="relative">
                      <ShoppingBag size={26} className="group-hover:text-black transition-colors" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-cocos-orange text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold mt-1">Bag</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Categories Nav */}
      <nav className="w-full border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto flex items-center px-4 py-3 text-xs font-bold overflow-x-auto hide-scrollbar">
            <div className="flex gap-6 items-center whitespace-nowrap">
                <button 
                  onClick={() => onNavigate('home')}
                  className={`flex items-center gap-1 uppercase pb-1 border-b-2 ${currentPage === 'home' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent'}`}
                >
                  Shop All
                </button>
                <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
                <button 
                  onClick={() => onNavigate('women')}
                  className={`uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 ${currentPage === 'women' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent'}`}
                >
                  Women
                </button>
                <button 
                  onClick={() => onNavigate('men')}
                  className={`uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 ${currentPage === 'men' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent'}`}
                >
                  Men
                </button>
                <button 
                  onClick={() => onNavigate('shoes')}
                  className={`uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 ${currentPage === 'shoes' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent'}`}
                >
                  Shoes
                </button>
                <button 
                  onClick={() => onNavigate('handbags')}
                  className={`uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 ${currentPage === 'handbags' ? 'text-cocos-orange border-cocos-orange' : 'border-transparent'}`}
                >
                  Handbags
                </button>
                <button className="uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 border-transparent">Gifts</button>
                <button className="uppercase hover:text-cocos-orange transition-colors pb-1 border-b-2 border-transparent">Now & Trending</button>
                <button className="uppercase text-cocos-orange hover:underline pb-1 border-b-2 border-transparent">Sale</button>
            </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
