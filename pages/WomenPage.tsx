
import React, { useMemo } from 'react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import CategoryRoundGrid from '../components/CategoryRoundGrid';
import { getImageByIndex } from '../imageStore';
import { ApiCategory } from '../lib/api';

interface Props {
  apiProducts?: Product[];
  apiCategories?: ApiCategory[];
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const toTitleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');

const slugImageMap: Record<string, string> = {
  women: '/women.jpg',
  dresses: getImageByIndex(0),
  shoes: getImageByIndex(13),
  handbags: getImageByIndex(14),
  activewear: getImageByIndex(15),
  jewelry: getImageByIndex(16),
  fragrance: getImageByIndex(80),
  watches: getImageByIndex(34),
  gifts: getImageByIndex(95),
  home: getImageByIndex(94),
  men: getImageByIndex(31),
};
const fallbackCategoryImageIndexes = [11, 12, 17, 18, 19, 20, 21, 22];

const resolveCategoryImage = (slug: string, index: number): string => {
  return slugImageMap[slug] ?? getImageByIndex(fallbackCategoryImageIndexes[index % fallbackCategoryImageIndexes.length]);
};

const WomenPage: React.FC<Props> = ({
  apiProducts = [],
  apiCategories = [],
  onProductClick,
  onToggleWishlist,
  onQuickView,
  wishlist = [],
}) => {
  const womenProducts = useMemo(
    () => apiProducts.filter((item) => item.categorySlugs?.includes('women')),
    [apiProducts],
  );

  const categories = useMemo<Category[]>(() => {
    const relevantSlugs = new Set<string>();
    for (const product of womenProducts) {
      for (const slug of product.categorySlugs ?? []) {
        relevantSlugs.add(slug);
      }
    }
    relevantSlugs.add('women');

    const activeRelevantCategories = apiCategories.filter(
      (category) => category.productCount > 0 && (category.slug === 'women' || relevantSlugs.has(category.slug)),
    );

    const sourceCategories =
      activeRelevantCategories.length > 0
        ? activeRelevantCategories
        : [...relevantSlugs]
            .sort((left, right) => left.localeCompare(right))
            .map((slug, index) => ({
              id: `fallback-${slug}-${index}`,
              slug,
              name: toTitleCase(slug),
              productCount: 0,
            }));

    return sourceCategories.map((category, index) => ({
      id: category.id,
      name: category.name,
      imageUrl: resolveCategoryImage(category.slug, index),
    }));
  }, [apiCategories, womenProducts]);

  const deals: Category[] = [
    { id: 'd1', name: 'CLOTHING', label: '30-50% OFF', subtext: 'Fresh arrivals in every fit.', imageUrl: getImageByIndex(17) },
    { id: 'd2', name: 'SHOES', label: 'UP TO 40% OFF', subtext: 'Boots, heels & sneakers.', imageUrl: getImageByIndex(18) },
    { id: 'd3', name: 'ACCESSORIES', label: 'BUY 1 GET 1 50% OFF', subtext: 'Scarves, hats & more.', imageUrl: getImageByIndex(19) },
  ];

  const products = womenProducts.slice(0, 8);

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-pink-100 flex items-center justify-center overflow-hidden">
        <img
          src="/women.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          alt="Women's Fashion"
        />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Spring Starts Here</h2>
          <p className="text-xl font-bold uppercase tracking-widest">30-50% OFF NEW ARRIVALS</p>
          <button className="mt-8 bg-white text-black px-12 py-3 font-bold uppercase hover:bg-gray-100 transition-colors">Shop Now</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        <CategoryRoundGrid categories={categories} />

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Exclusive Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <div className="mt-20">
          <h2 className="text-[24px] font-bold mb-8">Trending Now</h2>
          {products.length ? (
            <ProductSlider
              products={products}
              onProductClick={onProductClick}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              wishlist={wishlist}
            />
          ) : (
            <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
              No products available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WomenPage;
