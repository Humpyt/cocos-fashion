
import React, { useState, useEffect } from 'react';
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
import WishlistPage from './pages/WishlistPage';
import QuickViewModal from './components/QuickViewModal';
import { Product, CartItem, User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, selectedProduct]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('productDetail');
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
    setCurrentPage('cart');
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
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
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={setCurrentPage}
            onProductClick={handleProductClick}
            onToggleWishlist={toggleWishlist}
            onAddToBag={addToCart}
            onQuickView={setQuickViewProduct}
            wishlist={wishlist}
          />
        );
      case 'women':
        return <WomenPage onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlist={wishlist} />;
      case 'men':
        return <MenPage onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlist={wishlist} />;
      case 'shoes':
        return <ShoesPage onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlist={wishlist} />;
      case 'handbags':
        return <HandbagsPage onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} onQuickView={setQuickViewProduct} wishlist={wishlist} />;
      case 'wishlist':
        return <WishlistPage wishlist={wishlist} onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} onNavigate={setCurrentPage} onQuickView={setQuickViewProduct} />;
      case 'cart':
        return <CartPage cart={cart} onRemoveItem={removeFromCart} onUpdateQuantity={updateQuantity} onProductClick={handleProductClick} onNavigate={setCurrentPage} onQuickView={setQuickViewProduct} onToggleWishlist={toggleWishlist} wishlist={wishlist} />;
      case 'checkout':
        return (
          <CheckoutPage
            cart={cart}
            onNavigate={setCurrentPage}
            onOrderComplete={() => {
              clearCart();
              setCurrentPage('home');
            }}
          />
        );
      case 'auth':
        return <AuthPage onSignIn={handleSignIn} onNavigate={setCurrentPage} />;
      case 'dashboard':
        return user ? (
          <DashboardPage user={user} onSignOut={handleSignOut} onNavigate={setCurrentPage} onQuickView={setQuickViewProduct} />
        ) : (
          <AuthPage onSignIn={handleSignIn} onNavigate={setCurrentPage} />
        );
      case 'productDetail':
        return selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            onProductClick={handleProductClick}
            onAddToBag={addToCart}
            onToggleWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        ) : (
          <HomePage onNavigate={setCurrentPage} onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} wishlist={wishlist} />
        );
      default:
        return <HomePage onNavigate={setCurrentPage} onProductClick={handleProductClick} onToggleWishlist={toggleWishlist} wishlist={wishlist} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
      />

      <main className="flex-grow">
        {renderPage()}
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
    </div>
  );
};

export default App;
