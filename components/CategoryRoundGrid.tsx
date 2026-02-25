
import React from 'react';
import { Category } from '../types';

interface Props {
  categories: Category[];
  onCategorySelect?: (categoryIdOrSlug: string) => void;
  activeCategory?: string;
  showCounts?: boolean;
}

const FALLBACK_CATEGORY_IMAGE = '/women.jpg';

const CategoryRoundGrid: React.FC<Props> = ({
  categories,
  onCategorySelect,
  activeCategory,
  showCounts = false,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          aria-label={`Shop ${cat.name}`}
          aria-pressed={activeCategory === (cat.slug ?? cat.id)}
          onClick={() => onCategorySelect?.(cat.slug ?? cat.id)}
          className="flex flex-col items-center cursor-pointer group text-left bg-transparent border-0 p-0"
        >
          <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-full bg-gray-100">
            <img 
              src={cat.imageUrl} 
              alt={cat.name} 
              loading="lazy"
              decoding="async"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallbackApplied === '1') {
                  return;
                }
                target.dataset.fallbackApplied = '1';
                target.src = FALLBACK_CATEGORY_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none motion-reduce:transition-none"
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
          <span className={`text-sm font-bold uppercase tracking-tight text-center ${activeCategory === (cat.slug ?? cat.id) ? 'text-cocos-orange' : 'text-black'}`}>
            {cat.name}
          </span>
          {showCounts && typeof cat.count === 'number' && (
            <span className="text-[11px] font-bold text-gray-500 mt-1">{cat.count} items</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryRoundGrid;
