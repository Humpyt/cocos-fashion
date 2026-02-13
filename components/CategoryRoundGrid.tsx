
import React from 'react';
import { Category } from '../types';

interface Props {
  categories: Category[];
}

const CategoryRoundGrid: React.FC<Props> = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
      {categories.map((cat) => (
        <div key={cat.id} className="flex flex-col items-center cursor-pointer group">
          <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-full bg-gray-100">
            <img 
              src={cat.imageUrl} 
              alt={cat.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {cat.label && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <span className="bg-white/90 text-black text-sm font-black px-3 py-1 text-center leading-tight">
                        {cat.label}<br/>
                        <span className="text-[10px] font-normal uppercase">{cat.name}</span>
                    </span>
                </div>
            )}
          </div>
          <span className="text-sm font-bold uppercase tracking-tight text-center">{cat.name}</span>
        </div>
      ))}
    </div>
  );
};

export default CategoryRoundGrid;
