
import React from 'react';
import { ChevronDown } from 'lucide-react';

const PresidentsDayHeader: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 mt-6">
      <section className="bg-[#F5F2E8] py-8 px-8 md:px-12 border-b border-gray-200/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Title and Subtext */}
          <div className="flex flex-col">
            <h2 className="font-serif-promo text-[48px] md:text-[64px] font-bold leading-[1.1] tracking-tight">
              Presidents’ Day Sale
            </h2>
            <p className="text-[13px] font-bold mt-2 text-[#000]">
              Long weekend ahead—save now on denim, activewear, home & more, 20-60% off.
            </p>
          </div>

          {/* Right: Discount and Button */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="font-serif-promo text-[48px] md:text-[64px] font-bold leading-none whitespace-nowrap">
              Up to 60% OFF
            </div>
            
            <div className="relative">
              <button className="bg-white border border-gray-100 shadow-sm px-6 py-3.5 rounded-md flex items-center justify-between gap-12 text-sm font-bold min-w-[200px] hover:shadow-md transition-shadow">
                <span>Shop by category</span>
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PresidentsDayHeader;
