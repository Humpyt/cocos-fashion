import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';
import PresidentsDayHeader from '../components/PresidentsDayHeader';
import DealCardGrid from '../components/DealCardGrid';
import ProductSlider from '../components/ProductSlider';
import { Product, Category } from '../types';
import { getImageByIndex } from '../imageStore';

interface HomePageProps {
  apiProducts?: Product[];
  onProductClick?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onAddToBag?: (product: Product, quantity: number, size?: string, color?: string) => void;
  onQuickView?: (product: Product) => void;
  wishlist?: Product[];
}

const HomePage: React.FC<HomePageProps> = ({ apiProducts = [], onProductClick, onToggleWishlist, onAddToBag, onQuickView, wishlist = [] }) => {

  const getCategoryImage = (category: string, apiProducts: Product[]): string => {
    const categoryProducts = apiProducts.filter(p => {
      const slugs = p.categorySlugs ?? [];
      return slugs.includes(category.toLowerCase());
    });

    if (categoryProducts.length > 0) {
      return categoryProducts[0].imageUrl;
    }

    // Fallback to actual product images
    const imageMap: Record<string, string> = {
      'DRESSES': '/dresses/Kasper, gold jacket. Size 4US. 650k.jpeg',
      'SHOES': '/Ladies Shoes/Zara, maroon  size 40. 450k.jpeg',
      'HANDBAGS': '/women.jpg',
      'ACTIVEWEAR': '/Men/T-Shirts/Levis, shirt orange. Sizes S and XL. 200K.jpeg',
      'SHIRTS': '/Men/Shirts/Charles tyrwhitt,white sizes. 15.534in  To 17.536in.  230k- 370k.jpeg',
      'T-SHIRTS': '/Men/T-Shirts/Tommy hilfiger, navy size M 200k.jpeg',
      'WAISTCOATS': '/waist-coats/Zara,checked size. S. 250K.jpeg',
      'BLOUSES': '/blouses/Zara, checked blouse. Size S. 250K.jpeg',
    };

    return imageMap[category] ?? '/women.jpg';
  };

  const topDeals: Category[] = [
    {
      id: '1',
      name: 'DRESSES',
      label: '20% off',
      subtext: 'Elegant styles for every occasion.',
      imageUrl: getCategoryImage('DRESSES', apiProducts)
    },
    {
      id: '2',
      name: 'SHOES',
      label: '30% off',
      subtext: 'Step out in style with our footwear collection.',
      imageUrl: getCategoryImage('SHOES', apiProducts)
    },
    {
      id: '3',
      name: 'BLOUSES',
      label: '25% off',
      subtext: 'Versatile tops for your wardrobe.',
      imageUrl: getCategoryImage('BLOUSES', apiProducts)
    },
    {
      id: '4',
      name: 'SHIRTS',
      label: '30% off',
      subtext: 'Premium men\'s shirts & polos.',
      imageUrl: getCategoryImage('SHIRTS', apiProducts)
    },
    {
      id: '5',
      name: 'T-SHIRTS',
      label: '20% off',
      subtext: 'Comfortable casual essentials.',
      imageUrl: getCategoryImage('T-SHIRTS', apiProducts)
    },
    {
      id: '6',
      name: 'WAISTCOATS',
      label: 'From 250k',
      subtext: 'Sophisticated layering pieces.',
      imageUrl: '/waist-coats/Zara,checked size. S. 250K.jpeg'
    },
  ];

  const giftProducts = useMemo(() => {
    const dressProducts = apiProducts.filter(item => {
      const slugs = item.categorySlugs ?? [];
      return slugs.includes('dresses') && !item.name.toLowerCase().includes('zara');
    });
    const shirtProducts = apiProducts.filter(item => {
      const slugs = item.categorySlugs ?? [];
      const imageUrl = item.imageUrl.toLowerCase();
      // Match men's shirts: either has 'shirts' or 't-shirts' slug OR has /men/shirts/ or /men/t-shirts/ in image path
      return slugs.includes('shirts') || slugs.includes('t-shirts') || imageUrl.includes('/men/shirts/') || imageUrl.includes('/men/t-shirts/');
    });

    // Mix: 4 dresses + 2 shirts
    const mixed = [
      ...dressProducts.slice(0, 4),
      ...shirtProducts.slice(0, 2)
    ];

    // If we don't have 6 products, fill with more dresses
    if (mixed.length < 6 && dressProducts.length > 4) {
      const additional = dressProducts.slice(4, 4 + (6 - mixed.length));
      mixed.push(...additional);
    }

    return mixed.slice(0, 6);
  }, [apiProducts]);

  const trendingProducts = useMemo(() => {
    const womenProducts = apiProducts.filter(item => {
      const slugs = item.categorySlugs ?? [];
      return slugs.includes('women') || slugs.includes('dresses') || slugs.includes('shoes') || slugs.includes('blouses');
    });
    const menProducts = apiProducts.filter(item => {
      const slugs = item.categorySlugs ?? [];
      return slugs.includes('men') || slugs.includes('shirts') || slugs.includes('t-shirts');
    });

    // Mix both men and women products
    const mixed = [
      ...womenProducts.slice(0, 4),
      ...menProducts.slice(0, 4)
    ];

    return mixed.slice(0, 8);
  }, [apiProducts]);


  const clearanceCategories = [
    { label: 'Women', route: 'women' },
    { label: 'Men', route: 'men' },
    { label: 'Shoes', route: 'shoes' },
    { label: 'Handbags', route: 'handbags' }
  ];

  return (
    <div className="bg-white">
      <PresidentsDayHeader />

      <section className="bg-white py-12">
        <HeroSlider />
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-20">
        <div className="flex items-baseline gap-4 mb-12">
          <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Top Deals</h2>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        <DealCardGrid categories={topDeals} />
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-gray-100">
        <div className="mb-16">
          <div>
            <span className="text-cocos-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block">Kampala Edit</span>
            <h2 className="text-[44px] font-black uppercase tracking-tight font-serif-promo italic leading-none">New arrivals in store</h2>
          </div>
        </div>
        {giftProducts.length ? (
          <ProductSlider
            products={giftProducts}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlist={wishlist}
          />
        ) : (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">No products available yet.</div>
        )}
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-24">
        <div className="relative h-[500px] bg-stone-100 overflow-hidden group shadow-2xl">
          <img src={getImageByIndex(1)} className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110" alt="The Blouse Collection" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/40 backdrop-blur-[2px]">
            <div className="max-w-4xl px-8 transform transition-all duration-1000 group-hover:translate-y-[-20px]">
              <span className="text-[14px] font-black tracking-[0.6em] uppercase text-cocos-orange mb-4 block">Spring Campaign '25</span>
              <h2 className="text-[60px] md:text-[80px] font-black italic tracking-tighter mb-4 uppercase leading-[0.75] font-serif-promo">THE BLOUSE<br /><span className="text-cocos-orange">COLLECTION</span></h2>
              <p className="text-xl md:text-2xl font-bold mb-10 tracking-wide uppercase opacity-90">30-40% OFF. SHOP THE LATEST STYLES, COLORS & TRENDS.</p>
              <div className="flex flex-wrap gap-6 md:gap-8 justify-center">
                <Link to="/women" className="bg-black text-white px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-black transition-all shadow-2xl">Shop Blouses</Link>
                <Link to="/men" className="bg-white text-black px-12 md:px-16 py-4 md:py-5 font-black uppercase text-xs tracking-[0.3em] hover:bg-cocos-orange hover:text-white transition-all shadow-2xl">View Lookbook</Link>
              </div>
            </div>
          </div>

          <div className="absolute left-12 bottom-12 hidden md:block border-l-4 border-cocos-orange pl-8">
            <div className="flex flex-col gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-white">
              <Link to="/women" className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Women</Link>
              <Link to="/men" className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Men</Link>
              <Link to="/shoes" className="text-left hover:text-cocos-orange underline decoration-cocos-orange underline-offset-4">Shoes</Link>
              <Link to="/women" className="text-left hover:text-cocos-orange">Shop All Blouses</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-gray-100">
        <div className="flex items-baseline gap-4 mb-16">
          <h2 className="text-[36px] font-black tracking-tighter text-black uppercase">Coco's Trending Now</h2>
          <div className="h-px flex-grow bg-gray-100"></div>
        </div>
        {trendingProducts.length ? (
          <ProductSlider
            products={trendingProducts}
            onProductClick={onProductClick}
            onToggleWishlist={onToggleWishlist}
            onQuickView={onQuickView}
            wishlist={wishlist}
          />
        ) : (
          <div className="border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">No products available yet.</div>
        )}
      </section>

      <div className="bg-black text-white py-40 mt-24 border-y-[16px] border-cocos-orange relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-cocos-orange/5 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-[1600px] mx-auto px-4 text-center relative z-10">
          <h2 className="text-[48px] sm:text-[60px] md:text-[140px] font-black italic mb-10 uppercase tracking-tighter leading-none font-serif-promo">
            CLEARANCE<br />
            <span className="text-cocos-orange">UP TO 30% OFF</span>
          </h2>
          <p className="text-[13px] md:text-[22px] font-black mb-20 uppercase tracking-[0.4em] md:tracking-[0.8em] text-gray-500">LIMITED TIME OFFERS - SHOP WHILE STOCKS LAST</p>
          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            {clearanceCategories.map(cat => (
              <Link
                key={cat.label}
                to={cat.route}
                className="group relative overflow-hidden bg-cocos-orange text-black px-12 py-5 font-black text-[13px] min-w-[180px] uppercase tracking-[0.3em] transition-all"
              >
                <span className="relative z-10 group-hover:text-white transition-colors">{cat.label}</span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
