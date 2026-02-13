
import React from 'react';
import { getImageByIndex } from '../imageStore';

const FurniturePromo: React.FC = () => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 mt-6">
      <section className="bg-white flex flex-col md:flex-row h-auto md:h-[540px] overflow-hidden border border-gray-100">
        {/* Left Content Area */}
        <div className="w-full md:w-[40%] p-12 md:p-16 flex flex-col justify-center bg-stone-50">
          <div className="mb-auto">
            <h2 className="text-[36px] font-black tracking-tighter uppercase leading-none mb-2 font-serif-promo">COCO'S HOME EVENT</h2>
            <p className="text-sm font-bold tracking-[0.2em] text-cocos-orange uppercase">UP TO 65% OFF</p>
          </div>

          <div className="mt-auto border-t border-cocos-orange/20 pt-8">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-widest">
              <button className="hover:text-cocos-orange underline decoration-cocos-orange">Living Room</button>
              <button className="hover:text-cocos-orange underline decoration-cocos-orange">Bedroom</button>
              <button className="hover:text-cocos-orange underline decoration-cocos-orange">Decor</button>
              <button className="hover:text-cocos-orange">Shop all</button>
            </div>
          </div>
        </div>

        {/* Right Image Area */}
        <div className="w-full md:w-[60%] relative">
          <img
            src={getImageByIndex(94)}
            className="w-full h-full object-cover"
            alt="Modern Living Room with Grey Sofa"
          />

          {/* White Floating Box Overlay */}
          <div className="absolute right-12 bottom-12 bg-white/95 p-8 md:p-12 text-center shadow-xl border-t-4 border-cocos-orange max-w-[320px]">
            <h3 className="text-[32px] font-black italic tracking-tighter mb-1 uppercase leading-none text-black">20-50% OFF</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-cocos-orange">THE CURATED COLLECTION</p>
            <button className="bg-black text-white w-full py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-cocos-orange hover:text-black transition-colors">
              SHOP COCO'S HOME
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FurniturePromo;
