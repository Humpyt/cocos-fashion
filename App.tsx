
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import WomenPage from './pages/WomenPage';
import MenPage from './pages/MenPage';
import ShoesPage from './pages/ShoesPage';
import HandbagsPage from './pages/HandbagsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import QuickViewModal from './components/QuickViewModal';
import WhatsAppButton from './components/WhatsAppButton';
import { Product, CartItem, User } from './types';
import {
  ApiCategory,
  ApiCatalogProduct,
  authApi,
  cartApi,
  catalogApi,
  resolveMediaUrl,
  tokenStore,
  wishlistApi,
} from './lib/api';

interface InfoPageProps {
  title: string;
  subtitle: string;
  points: string[];
}

const InfoPage: React.FC<InfoPageProps> = ({ title, subtitle, points }) => (
  <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
    <h1 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h1>
    <p className="mt-4 text-gray-600 text-base md:text-lg">{subtitle}</p>
    <div className="mt-8 bg-white border border-gray-200 rounded-sm p-6 md:p-8">
      <ul className="space-y-4">
        {points.map((point) => (
          <li key={point} className="text-gray-800 leading-relaxed">
            {point}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get('product');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<ApiCatalogProduct[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<ApiCategory[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  const catalogProductsForUi = useMemo<Product[]>(() => {
    return catalogProducts.map((item) => {
      const discount = item.originalPriceMinor && item.originalPriceMinor > item.priceMinor
        ? Math.round(((item.originalPriceMinor - item.priceMinor) / item.originalPriceMinor) * 100)
        : undefined;

      return {
        id: item.id,
        slug: item.slug,
        variantId: item.variants?.[0]?.id,
        brand: item.brand,
        name: item.name,
        currency: 'UGX',
        priceMinor: item.priceMinor,
        originalPriceMinor: item.originalPriceMinor ?? undefined,
        price: `UGX ${item.priceMinor.toLocaleString()}`,
        originalPrice: item.originalPriceMinor ? `UGX ${item.originalPriceMinor.toLocaleString()}` : undefined,
        discount: discount ? `${discount}% off` : undefined,
        rating: item.rating,
        reviews: item.reviewsCount,
        imageUrl: resolveMediaUrl(item.images?.[0]?.url),
        badge: item.badge || undefined,
        isNew: item.isNew,
        categorySlugs: item.categories?.map((cat) => cat.slug),
      };
    });
  }, [catalogProducts]);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const restoreSession = async () => {
      const existingToken = tokenStore.getAccessToken();
      const hasSessionHint = tokenStore.hasSessionHint();

      if (!existingToken && !hasSessionHint) {
        return;
      }

      const shouldTryRefresh = hasSessionHint;

      if (existingToken) {
        try {
          const me = await authApi.me(existingToken);
          setUser(me);
          return;
        } catch {
          tokenStore.clearAccessToken();
        }
      }

      if (!shouldTryRefresh) {
        return;
      }

      try {
        const refreshed = await authApi.refresh();
        tokenStore.setAccessToken(refreshed.accessToken);
        setUser(refreshed.user);
      } catch {
        tokenStore.clearAccessToken();
      }
    };

    void restoreSession();
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      setIsCatalogLoading(true);
      const [productsResult, categoriesResult] = await Promise.allSettled([
        catalogApi.listProducts({ page: 1, limit: 100 }),
        catalogApi.listCategories(),
      ]);

      if (productsResult.status === 'fulfilled') {
        setCatalogProducts(productsResult.value.items);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCatalogCategories(categoriesResult.value);
      }

      setIsCatalogLoading(false);
    };
    void loadCatalog();
  }, []);

  useEffect(() => {
    const token = tokenStore.getAccessToken();
    if (!token || !catalogProducts.length || !user) {
      return;
    }

    const loadWishlist = async () => {
      try {
        const items = await wishlistApi.list(token);
        const mapped = items
          .map((item) => catalogProducts.find((catalogItem) => catalogItem.id === item.productId))
          .filter((item): item is ApiCatalogProduct => Boolean(item))
          .map((item) => ({
            id: item.id,
            slug: item.slug,
            variantId: item.variants?.[0]?.id,
            brand: item.brand,
            name: item.name,
            currency: 'UGX',
            priceMinor: item.priceMinor,
            originalPriceMinor: item.originalPriceMinor ?? undefined,
            price: `UGX ${item.priceMinor.toLocaleString()}`,
            originalPrice: item.originalPriceMinor ? `UGX ${item.originalPriceMinor.toLocaleString()}` : undefined,
            rating: item.rating,
            reviews: item.reviewsCount,
            imageUrl: resolveMediaUrl(item.images?.[0]?.url),
            badge: item.badge || undefined,
            isNew: item.isNew,
            categorySlugs: item.categories?.map((cat) => cat.slug),
          }));

        setWishlist(mapped);
      } catch {
        // keep local wishlist when backend is unavailable
      }
    };

    void loadWishlist();
  }, [catalogProducts, user]);

  const findCatalogMatch = (product: Product): ApiCatalogProduct | undefined => {
    if (product.id && catalogProducts.some((item) => item.id === product.id)) {
      return catalogProducts.find((item) => item.id === product.id);
    }

    return catalogProducts.find(
      (item) =>
        item.name.toLowerCase() === product.name.toLowerCase() &&
        item.brand.toLowerCase() === product.brand.toLowerCase(),
    );
  };

  const findProductBySlug = (slug: string): Product | undefined => {
    return catalogProductsForUi.find((product) => product.slug === slug);
  };

  const handleProductClick = (product: Product) => {
    navigate(`/?product=${product.slug}`);
  };

  const addToCart = (product: Product, quantity: number, size?: string, color?: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });

    const token = tokenStore.getAccessToken();
    const guestId = tokenStore.getOrCreateGuestId();
    const catalogMatch = findCatalogMatch(product);
    const variantId = product.variantId || catalogMatch?.variants?.[0]?.id;
    if (!variantId) {
      return;
    }

    void cartApi.addItem({
      variantId,
      quantity,
      token,
      guestId: token ? undefined : guestId,
    }).catch(() => {
      // local cart remains the fallback source for UI
    });
  };

  const toggleWishlist = (product: Product) => {
    const existing = wishlist.some((item) => item.id === product.id);
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });

    const token = tokenStore.getAccessToken();
    if (!token) {
      return;
    }

    const catalogMatch = findCatalogMatch(product);
    const productId = catalogMatch?.id ?? (/^[0-9a-f-]{36}$/i.test(product.id) ? product.id : undefined);
    if (!productId) {
      return;
    }

    void (existing ? wishlistApi.remove(token, productId) : wishlistApi.add(token, productId)).catch(() => {
      // local wishlist remains fallback
    });
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCart(prevCart => prevCart.filter(item =>
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    setCart(prevCart => prevCart.map(item =>
      (item.id === id && item.selectedSize === size && item.selectedColor === color)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleSignIn = (userData: User) => {
    setUser(userData);
    const redirectPath = userData.role === 'ADMIN' ? '/admin' : '/dashboard';

    // Navigate immediately - don't wait for cart/wishlist merge
    navigate(redirectPath);

    // Merge cart and wishlist in background
    void (async () => {
      const token = tokenStore.getAccessToken();
      if (!token) {
        return;
      }

      const guestId = tokenStore.getOrCreateGuestId();
      await cartApi.merge(token, guestId).catch(() => undefined);

      const wishlistIds = wishlist
        .map((item) => findCatalogMatch(item)?.id ?? (/^[0-9a-f-]{36}/i.test(item.id) ? item.id : undefined))
        .filter((id): id is string => Boolean(id));

      if (wishlistIds.length) {
        await wishlistApi.merge(token, wishlistIds).catch(() => undefined);
      }
    })();
  };

  const handleSignOut = () => {
    void (async () => {
      try {
        await authApi.logout(tokenStore.getAccessToken());
      } catch {
        // ignore logout transport errors
      } finally {
        tokenStore.clearAccessToken();
        setUser(null);
        navigate('/');
      }
    })();
  };

  const selectedProduct = productSlug ? findProductBySlug(productSlug) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            selectedProduct ? (
              <ProductDetailPage
                product={selectedProduct}
                onProductClick={handleProductClick}
                onAddToBag={addToCart}
                onToggleWishlist={toggleWishlist}
                wishlist={wishlist}
              />
            ) : (
              <HomePage
                apiProducts={catalogProductsForUi}
                onProductClick={handleProductClick}
                onToggleWishlist={toggleWishlist}
                onAddToBag={addToCart}
                onQuickView={setQuickViewProduct}
                wishlist={wishlist}
              />
            )
          } />
          <Route path="/women" element={
            <WomenPage
              apiProducts={catalogProductsForUi}
              apiCategories={catalogCategories}
              isCatalogLoading={isCatalogLoading}
              onProductClick={handleProductClick}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickViewProduct}
              onAddToBag={addToCart}
              wishlist={wishlist}
            />
          } />
          <Route path="/men" element={
            <MenPage
              apiProducts={catalogProductsForUi}
              onProductClick={handleProductClick}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickViewProduct}
              wishlist={wishlist}
            />
          } />
          <Route path="/shoes" element={
            <ShoesPage
              apiProducts={catalogProductsForUi}
              onProductClick={handleProductClick}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickViewProduct}
              wishlist={wishlist}
            />
          } />
          <Route path="/handbags" element={
            <HandbagsPage
              apiProducts={catalogProductsForUi}
              onProductClick={handleProductClick}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickViewProduct}
              wishlist={wishlist}
            />
          } />
          <Route path="/wishlist" element={
            <WishlistPage
              wishlist={wishlist}
              onProductClick={handleProductClick}
              onToggleWishlist={toggleWishlist}
              onQuickView={setQuickViewProduct}
            />
          } />
          <Route path="/about" element={
            <InfoPage
              title="About Coco's"
              subtitle="Coco's Fashion Brands Uganda curates quality fashion with a strong local identity."
              points={[
                "We combine global inspiration with styles that fit everyday life in Uganda.",
                "Our goal is to make premium fashion more accessible through trusted sourcing and fair pricing.",
                "We continue investing in digital shopping experiences and responsive customer support.",
              ]}
            />
          } />
          <Route path="/vision" element={
            <InfoPage
              title="Vision"
              subtitle="To become East Africa's most trusted destination for modern, accessible fashion."
              points={[
                "Lead with customer trust, quality, and consistency in every category.",
                "Set a new standard for seamless omnichannel fashion shopping in the region.",
                "Build a long-term brand that celebrates confidence, creativity, and culture.",
              ]}
            />
          } />
          <Route path="/mission" element={
            <InfoPage
              title="Mission"
              subtitle="Deliver exceptional fashion value through curated products, reliable service, and innovation."
              points={[
                "Offer thoughtfully selected products that balance style, quality, and affordability.",
                "Serve customers quickly and transparently across shopping, delivery, and support.",
                "Continuously improve our platform and operations based on customer feedback.",
              ]}
            />
          } />
          <Route path="/core-values" element={
            <InfoPage
              title="Core Values"
              subtitle="Our values drive every product decision, customer interaction, and business partnership."
              points={[
                "Customer First: We prioritize customer needs and long-term satisfaction.",
                "Integrity: We communicate clearly and honor our commitments.",
                "Excellence: We hold a high bar for quality, detail, and execution.",
                "Innovation: We adapt fast and build for tomorrow's shopper.",
              ]}
            />
          } />
          <Route path="/home-ground" element={
            <InfoPage
              title="Home Ground"
              subtitle="Proudly rooted in Uganda, serving a growing community of fashion-forward customers."
              points={[
                "Our home market shapes how we design assortments, pricing, and service.",
                "We collaborate with local teams and partners to stay close to customer needs.",
                "From Kampala outward, we are committed to scaling with local relevance and global standards.",
              ]}
            />
          } />
          <Route path="/cart" element={
            <CartPage
              cart={cart}
              onRemoveItem={removeFromCart}
              onUpdateQuantity={updateQuantity}
              onProductClick={handleProductClick}
              onQuickView={setQuickViewProduct}
              onToggleWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
          <Route path="/checkout" element={
            <CheckoutPage
              cart={cart}
              onOrderComplete={() => {
                clearCart();
                navigate('/');
              }}
            />
          } />
          <Route path="/auth" element={
            <AuthPage onSignIn={handleSignIn} />
          } />
          <Route path="/dashboard" element={
            user ? (
              <DashboardPage
                user={user}
                onSignOut={handleSignOut}
                onQuickView={setQuickViewProduct}
              />
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
          <Route path="/admin" element={
            user ? (
              user.role === 'ADMIN' ? (
                <AdminPage user={user} onSignOut={handleSignOut} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/auth" replace />
            )
          } />
        </Routes>
      </main>

      <Footer />

      {/* Global Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToBag={addToCart}
        onToggleWishlist={toggleWishlist}
        wishlist={wishlist}
      />

      {/* Floating WhatsApp for Mobile/Global */}
      <WhatsAppButton />
    </div>
  );
};

export default App;
