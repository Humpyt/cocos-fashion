import React from 'react';
import { getImageByIndex } from '../imageStore';

const BrandSpotlight: React.FC = () => {
  const brands = [
    { name: 'Lancôme', desc: 'Rénergie H.P.N. 300-Peptide Cream', img: getImageByIndex(81) },
    { name: 'Anolon', desc: 'Tri-Ply Stainless Steel Collection', img: getImageByIndex(93) },
    { name: 'Sports Shop', desc: 'Sportswear for everyone.', img: getImageByIndex(14) },
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-12 md:py-24">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-12 mb-12">
        <div className="w-full lg:w-1/3 bg-black text-white p-8 md:p-12 flex flex-col justify-center relative min-h-[300px]">
          <div className="absolute top-6 left-6">
            <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
          </div>
          <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter leading-tight uppercase">
            This season's most anticipated arrivals from the best brands.
          </h2>
          <button className="mt-8 text-xs font-black underline uppercase tracking-widest text-left hover:text-cocos-orange transition-colors">See all arrivals</button>
        </div>
        <div className="w-full lg:w-2/3 h-[300px] md:h-auto">
          <img src={getImageByIndex(82)} className="w-full h-full object-cover" alt="Main Arrival" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {brands.map(brand => (
          <div key={brand.name} className="flex flex-col group cursor-pointer">
            <div className="aspect-square overflow-hidden mb-5 bg-gray-100 relative">
              <img src={brand.img} alt={brand.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <h3 className="text-lg font-bold uppercase mb-1.5 tracking-tight">{brand.name}</h3>
            <p className="text-xs text-gray-600 font-bold uppercase tracking-wider">{brand.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandSpotlight;
