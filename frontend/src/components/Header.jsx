import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ cartItems, cartBounce, currentUser, setCurrentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.error("Failed to fetch products for search", err));
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  return (
    <>
      <nav className="top-nav">
          <div className="container flex justify-between items-center">
              <div className="location">
                  <i className="fas fa-map-marker-alt"></i> Ship to: <strong>Global</strong>
              </div>
              <div className="nav-links">
                  {currentUser ? (
                    <>
                      <span style={{ color: '#e1251b' }}>Welcome back, {currentUser.username}!</span>
                      {currentUser.role === 'admin' && (
                        <Link to="/dashboard">Admin Dashboard</Link>
                      )}
                      <span style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); setCurrentUser(null); }}>Logout</span>
                    </>
                  ) : (
                    <>
                      <Link to="/login">Login</Link>
                      <Link to="/login">Register</Link>
                    </>
                  )}
                  {currentUser && (
                    <Link to="/my-orders">My Orders</Link>
                  )}
                  <span style={{ cursor: 'pointer', color: '#666' }}>Customer Service</span>
                  <span style={{ cursor: 'pointer', color: '#666' }}>English / USD</span>
              </div>
          </div>
      </nav>

      <header className="main-header">
          <div className="container flex justify-between items-center">
              <div className="logo-area">
                  <Link to="/" className="flex items-center" style={{ textDecoration: 'none' }}>
                      <h1>JD<span>GLOBAL</span></h1>
                  </Link>
              </div>
              
              <div className="search-bar" style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Search for premium products, electronics, fashion..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery.trim() && setIsSearching(true)}
                    onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                  />
                  <button><i className="fas fa-search"></i></button>

                  {/* Auto-suggest Dropdown */}
                  {isSearching && searchResults.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, 
                      backgroundColor: '#ffffff', borderRadius: '0 0 12px 12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000,
                      maxHeight: '350px', overflowY: 'auto', border: '1px solid #e5e7eb',
                      marginTop: '4px'
                    }}>
                      {searchResults.map((prod) => (
                        <div 
                          key={prod.id}
                          onClick={() => {
                            navigate(`/product/${prod.id}`);
                            setIsSearching(false);
                            setSearchQuery('');
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                            cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <img src={prod.image} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{prod.name}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'capitalize' }}>{prod.category}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--jd-red)' }}>${prod.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              
              <Link to="/cart" className="cart-btn" style={{ 
                transform: cartBounce ? 'scale(1.1)' : 'scale(1)',
                backgroundColor: cartBounce ? 'var(--jd-red)' : 'var(--bg-white)',
                color: cartBounce ? 'white' : 'inherit',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}>
                  <i className="fas fa-shopping-cart"></i>
                  <span>Cart</span>
                  <span className="cart-count">{cartItems ? cartItems.length : 0}</span>
              </Link>
          </div>
      </header>

      <nav className="category-nav">
          <div className="container">
              <ul className="category-nav-list">
                  <li className={currentPath === '/' ? 'active' : ''}>
                      <Link to="/">Home</Link>
                  </li>
                  <li className={currentPath === '/flash-deals' ? 'active' : ''}>
                      <Link to="/flash-deals">Flash Deals</Link>
                  </li>
                  <li className={currentPath === '/new-arrivals' ? 'active' : ''}>
                      <Link to="/new-arrivals">New Arrivals</Link>
                  </li>
                  <li className={currentPath === '/electronics' ? 'active' : ''}>
                      <Link to="/electronics">Electronics</Link>
                  </li>
                  <li className={currentPath === '/fashion' ? 'active' : ''}>
                      <Link to="/fashion">Fashion</Link>
                  </li>
                  <li className={currentPath === '/global-brands' ? 'active' : ''}>
                      <Link to="/global-brands">Global Brands</Link>
                  </li>
              </ul>
          </div>
      </nav>
    </>
  );
};

export default Header;
