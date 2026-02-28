
import React from 'react';
import { ChevronDown } from 'lucide-react';

const PresidentsDayHeader: React.FC = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 mt-4 md:mt-6">
      <section className="bg-[#F5F2E8] py-3 md:py-5 px-6 md:px-10 border-b border-gray-200/50 rounded-sm shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8">
          {/* Left: Title and Subtext */}
          <div className="flex flex-col text-center lg:text-left">
            <h2 className="font-serif-promo text-[24px] md:text-[42px] font-bold leading-tight tracking-tight text-black">
              Seasonal Sale
            </h2>
            <p className="text-[10px] md:text-[12px] font-bold mt-1 text-gray-700 max-w-sm mx-auto lg:mx-0">
              Discover amazing deals on dresses, activewear, shoes & more.
            </p>
          </div>

          {/* Right: Discount and Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-12 w-full lg:w-auto">
            <div className="font-serif-promo text-[28px] md:text-[48px] font-black leading-none whitespace-nowrap text-cocos-orange lg:text-black">
              Up to 30% OFF
            </div>
            
            <div className="w-full sm:w-auto">
              <button className="bg-white border border-gray-200 shadow-sm px-5 py-2.5 rounded-sm flex items-center justify-between gap-6 text-[10px] md:text-xs font-black w-full sm:min-w-[180px] hover:bg-gray-50 transition-all uppercase tracking-widest">
                <span>Shop by category</span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PresidentsDayHeader;
