import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import FlashDeals from './components/FlashDeals';
import NewArrivals from './components/NewArrivals';
import Electronics from './components/Electronics';
import Fashion from './components/Fashion';
import GlobalBrands from './components/GlobalBrands';
import Dashboard from './components/Dashboard/index.jsx';
import MyOrders from './components/MyOrders';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CategoryShowcase from './components/CategoryShowcase';

function Layout({ children, cartItems, cartBounce, currentUser, setCurrentUser }) {
  return (
    <>
      <Header cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser} />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes() {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('currentUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cartBounce, setCartBounce] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    if (!currentUser) {
      // If user is not logged in, redirect to login page
      navigate('/login');
      return;
    }
    
    setCartItems(prev => [...prev, product]);
    setCartBounce(true);
    setTimeout(() => {
      setCartBounce(false);
    }, 200);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
      
      {/* Homepage Route */}
      <Route 
        path="/" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <Hero />
            <CategoryShowcase />
            <ProductGrid onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />
      
      {/* Product Detail Route */}
      <Route 
        path="/product/:id" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <ProductDetail onAddToCart={handleAddToCart} currentUser={currentUser} />
          </Layout>
        } 
      />
      
      {/* Flash Deals Route */}
      <Route 
        path="/flash-deals" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <FlashDeals onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />
      
      {/* New Arrivals Route */}
      <Route 
        path="/new-arrivals" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <NewArrivals onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />

      {/* Electronics Route */}
      <Route 
        path="/electronics" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <Electronics onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />

      {/* Fashion Route */}
      <Route 
        path="/fashion" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <Fashion onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />

      {/* Global Brands Route */}
      <Route 
        path="/global-brands" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <GlobalBrands onAddToCart={handleAddToCart} />
          </Layout>
        } 
      />

      {/* Dashboard Route (No Layout Wrapper) - Protected Route */}
      <Route 
        path="/dashboard" 
        element={currentUser && currentUser.role === 'admin' ? <Dashboard setCurrentUser={setCurrentUser} /> : <Navigate to="/" />} 
      />

      {/* My Orders Route */}
      <Route 
        path="/my-orders" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <MyOrders currentUser={currentUser} />
          </Layout>
        } 
      />

      {/* Cart Route */}
      <Route 
        path="/cart" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <Cart currentUser={currentUser} cartItems={cartItems} clearCart={clearCart} />
          </Layout>
        } 
      />

      {/* Checkout Route */}
      <Route 
        path="/checkout" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <Checkout currentUser={currentUser} clearCart={clearCart} />
          </Layout>
        } 
      />

      {/* Catch-all Route for 404 */}
      <Route 
        path="*" 
        element={
          <Layout cartItems={cartItems} cartBounce={cartBounce} currentUser={currentUser} setCurrentUser={setCurrentUser}>
            <div className="container" style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
              <h2>404 - Page Not Found</h2>
              <p style={{ marginTop: '16px', color: '#666' }}>The page you are looking for does not exist.</p>
              <a href="/" style={{ color: 'var(--jd-red)', marginTop: '24px', display: 'inline-block', fontWeight: 'bold' }}>
                &larr; Return to Homepage
              </a>
            </div>
          </Layout>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
