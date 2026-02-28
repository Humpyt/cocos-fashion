
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, User as UserIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  user?: User | null;
}

const Header: React.FC<HeaderProps> = ({ cartCount = 0, wishlistCount = 0, user }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const categories = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'women', label: 'Women', path: '/women' },
    { id: 'men', label: 'Men', path: '/men' },
    { id: 'shoes', label: 'Shoes', path: '/shoes' },
    { id: 'handbags', label: 'Handbags', path: '/handbags', hidden: true },
    { id: 'gifts', label: 'Gifts', hidden: true },
    { id: 'now', label: 'Now & Trending', hidden: true },
    { id: 'sale', label: 'Sale', isOrange: true, hidden: true }
  ];

  const visibleCategories = categories.filter(cat => !cat.hidden);
  const aboutLinks = [
    { id: 'about', label: "About Coco's", path: '/about' },
    { id: 'vision', label: 'Vision', path: '/vision' },
    { id: 'mission', label: 'Mission', path: '/mission' },
    { id: 'core-values', label: 'Core Values', path: '/core-values' },
    { id: 'home-ground', label: 'Home Ground', path: '/home-ground' },
  ];

  const handleMobileNav = () => {
    setIsMenuOpen(false);
  };

  const isAboutPage = ['/about', '/vision', '/mission', '/core-values', '/home-ground'].includes(location.pathname);

  return (
    <header className="w-full flex flex-col bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Utility Nav - Hidden on Mobile */}
      <div className="w-full bg-white text-[11px] font-bold border-b border-gray-100 py-1.5 px-4 hidden md:flex justify-between items-center text-[#555]">
        <div className="flex gap-4">
          <a href="#" className="hover:underline">COCO'S UGANDA DEALS</a>
          <a href="#" className="hover:underline">Fashion Week deals</a>
          <a href="#" className="text-cocos-orange hover:underline">See All &gt;</a>
        </div>
      </div>

      {/* Main Branding & Search */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between py-3 md:py-5 px-4 gap-4 md:gap-8">
        <div className="w-full md:w-auto flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-4 cursor-pointer">
            <div className="relative w-10 h-10 md:w-14 md:h-14">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF9500', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#FF7D00', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path fill="url(#starGradient)" d="M50 5L61.8 38.2H95L68.2 57.8L80 91L50 71.4L20 91L31.8 57.8L5 38.2H38.2L50 5Z" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <h1 className="text-[24px] md:text-[38px] font-black tracking-tighter text-black font-serif-promo flex items-baseline">
                COCO<span className="text-cocos-orange text-[16px] md:text-[24px] mx-0.5 mt-[-5px] md:mt-[-10px]">★</span>S
              </h1>
              <span className="text-[9px] md:text-[14px] font-black tracking-[0.2em] text-cocos-orange uppercase mt-[-2px] md:mt-[-4px]">FASHION BRANDS UG</span>
            </div>
          </Link>

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-1">
            <Link to="/wishlist" className="p-2 relative">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="p-2 relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="absolute top-1 right-1 bg-cocos-orange text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full md:flex-grow max-w-2xl relative order-3 md:order-none mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Search Coco's..."
            className="w-full bg-[#f1f1f1] border-none rounded-sm px-4 py-2.5 md:py-3 text-sm outline-none focus:ring-1 focus:ring-cocos-orange"
          />
          <Search className="absolute right-4 top-2.5 md:top-3 text-gray-400" size={18} />
        </div>

        {/* Desktop Account Actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-[11px] text-gray-600 hidden lg:block leading-tight text-right">
            {user ? `Hi, ${user.firstName}` : 'Discover'}<br />
            <span className="font-bold text-black uppercase">Your Style</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-2 bg-gray-100 px-4 py-2.5 rounded-sm hover:bg-gray-200 border border-gray-200">
                <UserIcon size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Account</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="bg-black text-white text-xs font-bold px-4 py-2.5 rounded-sm hover:bg-gray-800 uppercase tracking-wider">
                  Admin
                </Link>
              )}
            </div>
          ) : (
            <Link to="/auth" className="bg-black text-white text-xs font-bold px-8 py-3.5 rounded-sm hover:bg-gray-800 uppercase tracking-widest">Sign In</Link>
          )}

          <div className="flex items-center gap-5 text-gray-700">
            <Link to="/wishlist" className="flex flex-col items-center group cursor-pointer relative">
              <div className="relative">
                <Heart size={28} className={location.pathname === '/wishlist' ? 'text-cocos-orange fill-cocos-orange' : 'group-hover:text-cocos-orange'} />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-cocos-orange text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{wishlistCount}</span>}
              </div>
              <span className="text-[10px] font-bold mt-1 uppercase">Wish</span>
            </Link>

            <Link to="/cart" className="flex flex-col items-center group cursor-pointer relative">
              <div className="relative">
                <ShoppingBag size={28} className={location.pathname === '/cart' ? 'text-cocos-orange fill-cocos-orange' : ''} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-cocos-orange text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cartCount}</span>}
              </div>
              <span className="text-[10px] font-bold mt-1 uppercase">Bag</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Categories Nav - Desktop Only */}
      <nav className="hidden md:block w-full border-t border-gray-100">
        <div className="max-w-[1600px] mx-auto flex items-center px-4 py-3 text-[12px] font-bold overflow-x-auto hide-scrollbar">
          <div className="flex gap-8 items-center whitespace-nowrap">
            {visibleCategories.map((cat, idx) => {
              if (cat.id === 'about') {
                return (
                  <React.Fragment key={cat.id}>
                    <div className="relative" onMouseEnter={() => setIsAboutOpen(true)} onMouseLeave={() => setIsAboutOpen(false)}>
                      <button
                        onClick={() => setIsAboutOpen((prev) => !prev)}
                        className={`uppercase pb-1 border-b-2 transition-all inline-flex items-center gap-1 ${isAboutPage ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange'}`}
                      >
                        {cat.label}
                        <ChevronDown size={14} className={`transition-transform ${isAboutOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isAboutOpen && (
                        <div className="absolute left-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-lg z-50 py-2">
                          {aboutLinks.map((item) => (
                            <Link
                              key={item.id}
                              to={item.path}
                              className={`block w-full text-left px-4 py-2 text-[12px] font-bold uppercase tracking-wide hover:bg-gray-50 ${location.pathname === item.path ? 'text-cocos-orange' : 'text-black'}`}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {idx === 0 && <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>}
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={cat.id}>
                  <Link
                    to={cat.path}
                    className={`uppercase pb-1 border-b-2 transition-all ${cat.isOrange ? 'text-cocos-orange font-black hover:underline' : (location.pathname === cat.path ? 'text-cocos-orange border-cocos-orange' : 'border-transparent text-black hover:text-cocos-orange')}`}
                  >
                    {cat.label}
                  </Link>
                  {idx === 0 && <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 md:hidden">
          <div className="w-[85%] max-w-xs h-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-black font-serif-promo uppercase tracking-tight">Coco's Menu</h2>
              <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
              <Link
                to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                onClick={handleMobileNav}
                className="bg-gray-50 p-4 rounded-sm flex items-center gap-4 mb-4"
              >
                <UserIcon size={24} className="text-cocos-orange" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">My Account</p>
                  <p className="font-black text-sm uppercase">{user ? `Hi, ${user.firstName}` : 'Sign In / Register'}</p>
                </div>
              </Link>
              {visibleCategories.map(cat => (
                cat.id === 'about' ? (
                  <div key={cat.id} className="border-b border-gray-100 py-3">
                    <Link
                      to={cat.path}
                      onClick={handleMobileNav}
                      className="w-full flex justify-between items-center text-sm font-bold uppercase tracking-widest text-left"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </Link>
                    <div className="mt-2 pl-4 flex flex-col gap-2">
                      {aboutLinks.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={handleMobileNav}
                          className="text-xs font-bold uppercase tracking-wide text-left text-gray-600 hover:text-cocos-orange"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={cat.id}
                    to={cat.path}
                    onClick={handleMobileNav}
                    className="flex justify-between items-center py-3 border-b border-gray-100 text-sm font-bold uppercase tracking-widest text-left"
                  >
                    <span className={cat.isOrange ? 'text-cocos-orange' : ''}>{cat.label}</span>
                    <ChevronRight size={16} className="text-gray-400" />
                  </Link>
                )
              ))}
            </div>
            <div className="p-6 bg-stone-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
              Coco's Fashion Brands Uganda
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
