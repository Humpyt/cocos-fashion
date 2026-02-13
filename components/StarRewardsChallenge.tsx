import React from 'react';
import { getImageByIndex } from '../imageStore';

const StarRewardsChallenge: React.FC = () => {
  const categories = [
    { name: 'Fragrances', img: getImageByIndex(84) },
    { name: 'Jewelry & Watches', img: getImageByIndex(80) },
    { name: "Women's Shoes", img: getImageByIndex(42) },
    { name: 'Handbags', img: getImageByIndex(60) },
    { name: 'Sleep & Intimates', img: getImageByIndex(18) },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="bg-[#f5f5f5] p-12 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3 flex flex-col items-center text-center">
            <div className="bg-cocos-orange text-white p-8 mb-6 relative">
              <span className="absolute -top-4 -left-4 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 transform -rotate-12">NEW!</span>
              <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">★ Star Rewards Challenge</h3>
              <p className="text-xs font-bold border-t border-white/50 pt-2 uppercase tracking-widest">February Edition</p>
            </div>
            <h4 className="text-2xl font-black mb-4">Shop <span className="text-cocos-orange">2 of these 5</span> categories<br />& get UGX 40,000 in Star Money</h4>
            <p className="text-xs font-bold mb-6">(That's 1,000 bonus points!) Ends Feb. 28.</p>
            <button className="bg-black text-white px-8 py-3 font-bold text-sm uppercase">Track your progress</button>
            <p className="text-[10px] mt-4">Not a Star Rewards member? <span className="underline cursor-pointer">Join for free</span></p>
          </div>

          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden bg-cocos-orange flex flex-col justify-center items-center text-white text-center p-8">
              <h5 className="text-2xl font-black italic uppercase leading-tight">Start<br />shopping!</h5>
              <div className="absolute top-0 right-0 p-4">
                <svg className="w-12 h-12 fill-white opacity-20" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
              </div>
            </div>
            {categories.map(cat => (
              <div key={cat.name} className="relative group cursor-pointer overflow-hidden aspect-square bg-white shadow-sm border border-gray-100">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-x-0 bottom-0 bg-white/90 p-2 text-center">
                  <span className="text-[10px] font-bold uppercase">{cat.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StarRewardsChallenge;
