
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Pin as Pinterest, ChevronDown } from 'lucide-react';

const Footer: React.FC = () => {
  const sections = [
    {
      title: 'Shop Coco\'s',
      links: [
        { label: 'Women', path: '/women' },
        { label: 'Men', path: '/men' },
        { label: 'Shoes', path: '/shoes' },
        { label: 'Handbags', path: '/handbags' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: "About Coco's", path: '/about' },
        { label: 'Vision', path: '/vision' },
        { label: 'Mission', path: '/mission' },
        { label: 'Core Values', path: '/core-values' },
        { label: 'Home Ground', path: '/home-ground' },
      ],
    },
    {
      title: 'My Account',
      links: [
        { label: 'Sign In / Register', path: '/auth' },
        { label: 'My Dashboard', path: '/dashboard' },
        { label: 'My Wishlist', path: '/wishlist' },
        { label: 'Shopping Bag', path: '/cart' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { label: 'Contact Us', path: '/about' },
        { label: 'Shipping & Delivery', path: '/about' },
        { label: 'Returns & Exchanges', path: '/about' },
        { label: 'FAQ', path: '/about' },
      ],
    },
  ];

  return (
    <footer className="bg-black text-white border-t border-gray-800 mt-12 md:mt-24">
      {/* Email Signup & Sections */}
      <div className="max-w-[1600px] mx-auto px-4 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-b border-gray-800">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {sections.map(section => (
              <div key={section.title} className="group">
                <h4 className="text-[11px] md:text-xs font-black uppercase mb-4 md:mb-6 tracking-widest text-cocos-orange flex items-center justify-between">
                  {section.title}
                  <ChevronDown size={14} className="md:hidden text-gray-500" />
                </h4>
                <ul className="flex flex-col gap-3 md:gap-2">
                  {section.links.map(link => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-[12px] md:text-[11px] text-gray-400 hover:text-white hover:underline cursor-pointer transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Side */}
        <div className="flex flex-col gap-6 order-1 lg:order-2 bg-white/5 p-6 md:p-8 lg:bg-transparent lg:p-0 rounded-sm">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
            <span className="w-8 h-[2px] bg-cocos-orange"></span> Stay in the loop
          </h4>
          <p className="text-[12px] md:text-[11px] text-gray-400 leading-relaxed">Join Coco's insiders for exclusive access to trends and sales across East Africa.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="Email Address" className="w-full bg-white border-none px-4 py-3 text-sm rounded-sm text-black outline-none focus:ring-2 focus:ring-cocos-orange" />
            <button className="bg-cocos-orange text-black text-[11px] font-black px-6 py-3 rounded-sm uppercase tracking-widest hover:bg-white transition-colors whitespace-nowrap">Join Now</button>
          </div>

          <div className="mt-4 pt-6 border-t border-gray-800 lg:border-none">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-gray-500">Connect with us</h4>
            <div className="flex gap-6">
              <Facebook size={18} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-all" />
              <Instagram size={18} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-all" />
              <Twitter size={18} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-all" />
              <Youtube size={18} className="text-gray-400 hover:text-cocos-orange cursor-pointer transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Bottom Nav */}
      <div className="max-w-[1600px] mx-auto px-4 py-10 md:py-8 text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 font-bold uppercase text-[10px] tracking-widest text-gray-400">
          <a href="#" className="hover:text-cocos-orange transition-colors">Privacy</a>
          <a href="#" className="hover:text-cocos-orange transition-colors">Cookies</a>
          <a href="#" className="hover:text-cocos-orange transition-colors">Ads</a>
          <a href="#" className="hover:text-cocos-orange transition-colors">Legal</a>
          <a href="#" className="hover:text-cocos-orange transition-colors">Accessibility</a>
        </div>
        <p className="text-[10px] text-gray-600 font-medium tracking-wider uppercase">© 2025 Coco's Fashion Brands Uganda. Style is our standard.</p>
      </div>
    </footer>
  );
};

export default Footer;
