import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Category, Product } from '../types';
import DealCardGrid from '../components/DealCardGrid';
import CategoryRoundGrid from '../components/CategoryRoundGrid';
import { getImageByIndex } from '../imageStore';
import { ApiCategory } from '../lib/api';

interface Props {
  apiProducts?: Product[];
  apiCategories?: ApiCategory[];
  isCatalogLoading?: boolean;
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
  wishlist?: Product[];
}

type WomenSort = 'featured' | 'price-asc' | 'price-desc' | 'top-rated';

type WomenFilterState = {
  activeCategory: string;
  sortBy: WomenSort;
};

const toTitleCase = (value: string) =>
  value
    .split('-')
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');

const FALLBACK_PRODUCT_IMAGE = '/women.jpg';
const PAGE_SIZE = 30;
const localAsset = (path: string) => encodeURI(path);

const categoryImagePool = [
  '/women.jpg',
  '/dresses/Calvin Klein, Size 6US. 580k.jpeg',
  '/dresses/Kasper, gold jacket. Size  4US. 650k.jpeg',
  '/dresses/DKNY, BLACK SEQUIN SIZE 6US 580K.jpeg',
  '/blouses/Anne klein tropical green multi,sizeS 250k.jpeg',
  '/blouses/Donna karan nude peach,size XL 250k.jpeg',
  '/blouses/Zara brown satin  size M. 200k.jpeg',
  '/blouses/Hawes &Curtis, cream size 18uk 300k.jpeg',
].map(localAsset);

const slugImageMap: Record<string, string> = {
  women: '/women.jpg',
  blouses: localAsset('/blouses/Anne klein tropical green multi,sizeS 250k.jpeg'),
  dresses: localAsset('/dresses/Kasper, gold jacket. Size  4US. 650k.jpeg'),
  waistcoats: localAsset('/waist-coats/Zara,checked size. S.  250K.jpeg'),
  shoes: localAsset('/ladies-shoes/Aldo ,gold size 8.5 US. 350k.jpeg'),
  handbags: localAsset('/blouses/Zara,navy blue,Size M 200k.jpeg'),
  activewear: localAsset('/blouses/Kasper green floral,Size XL.   250k.jpeg'),
  jewelry: localAsset('/dresses/Eliza,gold sequins size 2US. 800k.jpeg'),
  fragrance: localAsset('/dresses/Hush, snake print sizeM 550k.jpeg'),
  watches: localAsset('/dresses/Tahari, cream size 18. 450k.jpeg'),
  gifts: localAsset('/blouses/Style & co size S. 175k.jpeg'),
  home: localAsset('/blouses/MNG ,CREAM SIZE S.  200K.jpeg'),
};

const resolveCategoryImage = (slug: string, index: number): string => {
  return slugImageMap[slug] ?? categoryImagePool[index % categoryImagePool.length];
};

const priceMinor = (product: Product): number => {
  if (typeof product.priceMinor === 'number') {
    return product.priceMinor;
  }

  const extracted = Number((product.price ?? '').replace(/[^\d]/g, ''));
  return Number.isFinite(extracted) ? extracted : 0;
};

const reviewsCount = (product: Product): number => product.reviewsCount ?? product.reviews ?? 0;
const hasBlouseMedia = (product: Product): boolean => product.imageUrl.toLowerCase().includes('/blouses/');
const hasDressMedia = (product: Product): boolean => product.imageUrl.toLowerCase().includes('/dresses/');

const WomenPage: React.FC<Props> = ({
  apiProducts = [],
  apiCategories = [],
  isCatalogLoading = false,
  onProductClick,
  onToggleWishlist,
  onQuickView,
  onAddToBag,
  wishlist = [],
}) => {
  const productsSectionRef = useRef<HTMLElement | null>(null);
  const [filterState, setFilterState] = useState<WomenFilterState>({
    activeCategory: 'all',
    sortBy: 'featured',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const womenProducts = useMemo(
    () =>
      apiProducts.filter((item) => {
        const slugs = item.categorySlugs ?? [];
        return slugs.includes('women') || slugs.includes('dresses') || slugs.includes('shoes');
      }),
    [apiProducts],
  );

  const categories = useMemo<Category[]>(() => {
    const relevantSlugs = new Set<string>();
    const slugCounts = new Map<string, number>();
    const blouseMediaCount = womenProducts.filter(hasBlouseMedia).length;
    const dressMediaCount = womenProducts.filter(hasDressMedia).length;

    for (const product of womenProducts) {
      for (const slug of product.categorySlugs ?? []) {
        relevantSlugs.add(slug);
        slugCounts.set(slug, (slugCounts.get(slug) ?? 0) + 1);
      }
    }

    relevantSlugs.add('women');
    slugCounts.set('women', womenProducts.length);
    relevantSlugs.add('dresses');
    slugCounts.set('dresses', Math.max(slugCounts.get('dresses') ?? 0, dressMediaCount));
    if (blouseMediaCount > 0) {
      relevantSlugs.add('blouses');
      slugCounts.set('blouses', Math.max(slugCounts.get('blouses') ?? 0, blouseMediaCount));
    }

    const apiRelevantCategories = apiCategories.filter(
      (category) => category.slug === 'women' || relevantSlugs.has(category.slug),
    );

    const sourceCategories = [
      ...apiRelevantCategories,
      ...[...relevantSlugs]
        .filter((slug) => !apiRelevantCategories.some((category) => category.slug === slug))
        .sort((left, right) => left.localeCompare(right))
        .map((slug, index) => ({
          id: `fallback-${slug}-${index}`,
          slug,
          name: toTitleCase(slug),
          productCount: slugCounts.get(slug) ?? 0,
        })),
    ];

    return sourceCategories
      .sort((left, right) => {
        if (left.slug === 'women') return -1;
        if (right.slug === 'women') return 1;
        return left.name.localeCompare(right.name);
      })
      .map((category, index) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        count: category.productCount || slugCounts.get(category.slug) || 0,
        imageUrl: resolveCategoryImage(category.slug, index),
      }));
  }, [apiCategories, womenProducts]);

  const filterOptions = useMemo(
    () => [{ key: 'all', label: 'All' }, ...categories.map((category) => ({ key: category.slug ?? category.id, label: category.name }))],
    [categories],
  );

  const getCategoryPriority = (product: Product): number => {
    const slugs = product.categorySlugs ?? [];
    const imageUrl = product.imageUrl.toLowerCase();

    if (slugs.includes('dresses') || hasDressMedia(product)) {
      return 1; // Dresses first
    }
    if (slugs.includes('blouses') || hasBlouseMedia(product)) {
      return 2; // Blouses second
    }
    if (slugs.includes('shoes') || imageUrl.includes('/ladies-shoes/') || imageUrl.includes('/shoes/')) {
      return 3; // Shoes last
    }
    return 0; // Other products in the middle
  };

  const filteredProducts = useMemo(() => {
    let filtered = womenProducts;

    if (filterState.activeCategory !== 'all' && filterState.activeCategory !== 'women') {
      if (filterState.activeCategory === 'blouses') {
        filtered = filtered.filter(
          (product) => product.categorySlugs?.includes('blouses') || hasBlouseMedia(product),
        );
      } else if (filterState.activeCategory === 'dresses') {
        filtered = filtered.filter(
          (product) => product.categorySlugs?.includes('dresses') || hasDressMedia(product),
        );
      } else {
        filtered = filtered.filter((product) => product.categorySlugs?.includes(filterState.activeCategory));
      }
    }

    const sorted = [...filtered];
    if (filterState.sortBy === 'price-asc') {
      sorted.sort((left, right) => priceMinor(left) - priceMinor(right));
    } else if (filterState.sortBy === 'price-desc') {
      sorted.sort((left, right) => priceMinor(right) - priceMinor(left));
    } else if (filterState.sortBy === 'top-rated') {
      sorted.sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0) || reviewsCount(right) - reviewsCount(left));
    } else {
      // Featured: Sort by category priority (dresses first, then blouses, then shoes)
      sorted.sort((left, right) => getCategoryPriority(left) - getCategoryPriority(right));
    }

    return sorted;
  }, [filterState.activeCategory, filterState.sortBy, womenProducts]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const pageStart = (effectivePage - 1) * PAGE_SIZE;
  const pageItems = useMemo(
    () => filteredProducts.slice(pageStart, pageStart + PAGE_SIZE),
    [filteredProducts, pageStart],
  );
  const itemRangeStart = totalItems === 0 ? 0 : pageStart + 1;
  const itemRangeEnd = pageStart + pageItems.length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const isInWishlist = (productId: string) => wishlist.some((item) => item.id === productId);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const setCategoryAndScroll = (category: string) => {
    setFilterState((prev) => ({ ...prev, activeCategory: category }));
    setCurrentPage(1);
    scrollToProducts();
  };

  const handleQuickAdd = (product: Product) => {
    if (product.variantId && onAddToBag) {
      onAddToBag(product, 1);
      return;
    }

    if (onQuickView) {
      onQuickView(product);
      return;
    }

    onProductClick?.(product);
  };

  const handlePageChange = (page: number) => {
    const boundedPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(boundedPage);
    scrollToProducts();
  };

  const hasDressesCategory = categories.some((category) => category.slug === 'dresses');
  const usingProductDerivedCategories = !isCatalogLoading && apiCategories.length === 0 && categories.length > 0;
  const showLoadingState = isCatalogLoading && womenProducts.length === 0;

  const deals: Category[] = [
    { id: 'd1', name: 'CLOTHING', label: '30-50% OFF', subtext: 'Fresh arrivals in every fit.', imageUrl: getImageByIndex(17) },
    { id: 'd2', name: 'SHOES', label: 'UP TO 40% OFF', subtext: 'Boots, heels & sneakers.', imageUrl: getImageByIndex(18) },
    { id: 'd3', name: 'ACCESSORIES', label: 'BUY 1 GET 1 50% OFF', subtext: 'Scarves, hats & more.', imageUrl: getImageByIndex(19) },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-[400px] bg-pink-100 flex items-center justify-center overflow-hidden">
        <img
          src="/women.jpg"
          onError={(event) => {
            const target = event.currentTarget;
            if (target.dataset.fallbackApplied === '1') {
              return;
            }
            target.dataset.fallbackApplied = '1';
            target.src = categoryImagePool[0];
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-85"
          alt="Women's Fashion"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
        <div className="relative z-10 text-center text-white drop-shadow-lg">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-3">Spring Starts Here</h2>
          <p className="text-sm sm:text-base md:text-xl font-bold uppercase tracking-[0.25em]">30-50% OFF NEW ARRIVALS</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCategoryAndScroll(hasDressesCategory ? 'dresses' : 'women')}
              className="bg-white text-black px-10 py-3 font-bold uppercase hover:bg-gray-100 transition-colors"
            >
              Shop Dresses
            </button>
            <button
              type="button"
              onClick={() => setCategoryAndScroll('all')}
              className="border border-white/80 bg-white/10 text-white px-10 py-3 font-bold uppercase hover:bg-white/20 transition-colors"
            >
              View All Women
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-16">
        <h2 className="text-[28px] font-black tracking-tight mb-8">Shop by Category</h2>
        {showLoadingState && categories.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`women-category-skeleton-${index}`} className="animate-pulse flex flex-col items-center">
                <div className="w-full aspect-square rounded-full bg-gray-200" />
                <div className="h-3 bg-gray-200 mt-3 w-3/4" />
                <div className="h-3 bg-gray-200 mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <CategoryRoundGrid
            categories={categories}
            activeCategory={filterState.activeCategory}
            onCategorySelect={setCategoryAndScroll}
            showCounts
          />
        )}
        {usingProductDerivedCategories && (
          <p className="text-xs text-gray-500 mt-4 uppercase tracking-wider">
            Showing categories from available Women products.
          </p>
        )}

        <div className="mt-20">
          <h2 className="text-[28px] font-black tracking-tight mb-8">Exclusive Deals</h2>
          <DealCardGrid categories={deals} />
        </div>

        <section ref={productsSectionRef} className="mt-20">
          <div className="sticky top-[72px] md:top-[124px] z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border border-gray-200 p-4 mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setFilterState((prev) => ({ ...prev, activeCategory: option.key }));
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap border transition-colors ${
                      filterState.activeCategory === option.key
                        ? 'bg-cocos-orange border-cocos-orange text-white'
                        : 'bg-white border-gray-300 text-black hover:border-cocos-orange hover:text-cocos-orange'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em]">
                Sort
                <select
                  value={filterState.sortBy}
                  onChange={(event) => {
                    setFilterState((prev) => ({ ...prev, sortBy: event.target.value as WomenSort }));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-cocos-orange"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                  <option value="top-rated">Top Rated</option>
                </select>
              </label>
            </div>
          </div>

          <h2 className="text-[24px] font-bold mb-8">Trending Now</h2>

          {showLoadingState ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 md:hidden">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`women-mobile-skeleton-${index}`} className="animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="h-4 bg-gray-200 mt-3 w-2/3" />
                    <div className="h-4 bg-gray-200 mt-2 w-1/3" />
                  </div>
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`women-desktop-skeleton-${index}`} className="animate-pulse">
                    <div className="aspect-[4/5] bg-gray-200" />
                    <div className="h-4 bg-gray-200 mt-3 w-2/3" />
                    <div className="h-4 bg-gray-200 mt-2 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredProducts.length ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {pageItems.map((product) => (
                  <article
                    key={`women-grid-${product.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onProductClick?.(product)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onProductClick?.(product);
                      }
                    }}
                    className="relative bg-white border border-gray-100 overflow-hidden"
                    aria-label={`Open product details for ${product.name}`}
                  >
                    <div className="relative aspect-[4/5] bg-gray-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.dataset.fallbackApplied === '1') {
                            return;
                          }
                          target.dataset.fallbackApplied = '1';
                          target.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
                        <button
                          type="button"
                          aria-label={`Toggle wishlist for ${product.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleWishlist?.(product);
                          }}
                          className={`w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow ${
                            isInWishlist(product.id) ? 'text-cocos-orange' : 'text-black'
                          }`}
                        >
                          <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Quick view ${product.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (onQuickView) {
                              onQuickView(product);
                            } else {
                              onProductClick?.(product);
                            }
                          }}
                          className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow text-black"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-black/90">
                        <button
                          type="button"
                          aria-label={`Quick add ${product.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleQuickAdd(product);
                          }}
                          className="w-full flex items-center justify-center gap-2 text-white text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                          <ShoppingBag size={14} /> Quick Add
                        </button>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-black">{product.brand}</p>
                      <h3 className="text-[15px] md:text-[17px] font-serif-promo leading-tight mt-1 line-clamp-2">{product.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-cocos-orange text-[16px] md:text-[18px] font-black">{product.price}</p>
                        <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1">
                          <Star size={10} fill="#FF7D00" className="text-cocos-orange" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {totalItems > PAGE_SIZE && (
                <nav className="mt-8 border-t border-gray-200 pt-6" aria-label="Women products pagination">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider text-center mb-4">
                    Showing {itemRangeStart}-{itemRangeEnd} of {totalItems}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      aria-label="Go to previous page"
                      onClick={() => handlePageChange(effectivePage - 1)}
                      disabled={effectivePage === 1}
                      className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:border-cocos-orange hover:text-cocos-orange transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={`women-page-${pageNumber}`}
                        type="button"
                        aria-label={`Go to page ${pageNumber}`}
                        aria-current={pageNumber === effectivePage ? 'page' : undefined}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`min-w-10 px-3 py-2 border text-xs font-bold ${
                          pageNumber === effectivePage
                            ? 'bg-cocos-orange text-white border-cocos-orange'
                            : 'border-gray-300 text-black hover:border-cocos-orange hover:text-cocos-orange'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="Go to next page"
                      onClick={() => handlePageChange(effectivePage + 1)}
                      disabled={effectivePage === totalPages}
                      className="px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:border-cocos-orange hover:text-cocos-orange transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600 space-y-4">
              <p>No products match your current filter yet.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilterState((prev) => ({ ...prev, activeCategory: 'all' }));
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2 border border-black text-black font-bold uppercase text-xs tracking-wider hover:bg-black hover:text-white transition-colors"
                >
                  Shop All Women
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterState((prev) => ({ ...prev, activeCategory: 'all', sortBy: 'featured' }));
                    setCurrentPage(1);
                  }}
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-bold uppercase text-xs tracking-wider hover:border-cocos-orange hover:text-cocos-orange transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WomenPage;
