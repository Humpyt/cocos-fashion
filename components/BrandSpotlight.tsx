
import React from 'react';

const BrandSpotlight: React.FC = () => {
  const brands = [
    { name: 'Lancôme', desc: 'Rénergie H.P.N. 300-Peptide Cream', img: 'https://picsum.photos/seed/b1/600/600' },
    { name: 'Anolon', desc: 'New! EverLast Tri-Ply Stainless Steel Collection', img: 'https://picsum.photos/seed/b2/600/600' },
    { name: 'Sports Shop', desc: 'Sportswear for everyone.', img: 'https://picsum.photos/seed/b3/600/600' },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 py-16">
        <div className="flex gap-12 mb-12">
            <div className="w-1/3 bg-black text-white p-12 flex flex-col justify-center relative">
                 <div className="absolute top-4 left-4">
                     <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                 </div>
                 <h2 className="text-4xl font-black italic tracking-tighter leading-tight uppercase">This season's most anticipated arrivals from the best brands.</h2>
            </div>
            <div className="w-2/3">
                 <img src="https://picsum.photos/seed/hero3/1200/600" className="w-full h-full object-cover" alt="Main Arrival" />
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brands.map(brand => (
                <div key={brand.name} className="flex flex-col group cursor-pointer">
                    <div className="aspect-square overflow-hidden mb-4 bg-gray-100">
                        <img src={brand.img} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <h3 className="text-xl font-bold uppercase mb-1">{brand.name}</h3>
                    <p className="text-sm text-gray-600 font-bold">{brand.desc}</p>
                </div>
            ))}
        </div>
    </section>
  );
};

export default BrandSpotlight;
