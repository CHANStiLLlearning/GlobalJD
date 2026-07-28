import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Star, Laptop, Smartphone, Headphones, Camera, Watch, Zap } from 'lucide-react';
import { API_BASE } from '../config/api';
import { FALLBACK_PRODUCTS } from '../config/fallbackProducts';

const Electronics = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        const rawItems = (Array.isArray(data) && data.length > 0) ? data : FALLBACK_PRODUCTS;
        const electronicsItems = rawItems.filter(p => {
          const cat = (p.category || '').toLowerCase();
          return cat.includes('electronics') || cat.includes('audio') || cat.includes('wearable') || 
                 cat.includes('computer') || cat.includes('photo') || cat.includes('smartphone');
        });
        setProducts(electronicsItems);
        setFilteredProducts(electronicsItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch electronics products:", err);
        const electronicsItems = FALLBACK_PRODUCTS.filter(p => (p.category || '').toLowerCase().includes('electronics'));
        setProducts(electronicsItems);
        setFilteredProducts(electronicsItems);
        setLoading(false);
      });
  }, []);

  const handleCategoryFilter = (catKey) => {
    setActiveCategory(catKey);
    if (catKey === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes(catKey);
      }));
    }
  };

  if (loading) {
    return (
      <section className="container" style={{ minHeight: '60vh', padding: '60px 0', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#64748b', fontWeight: '500' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px', color: 'var(--jd-red)' }}></i>
          Loading Electronics & High-Tech Devices...
        </div>
      </section>
    );
  }

  return (
    <div className="electronics-page" style={{ background: '#f8fafc', paddingBottom: '60px' }}>
      {/* High-Tech Cyber Hero Banner */}
      <div className="electronics-banner" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)', color: '#ffffff', padding: '50px 0', borderBottom: '3px solid #38bdf8', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div className="container electronics-banner-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="electronics-banner-text">
            <span style={{ background: 'rgba(56,189,248,0.2)', color: '#7dd3fc', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'inline-block' }}>
              NEXT-GEN HARDWARE & GADGETS
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              ⚡ Electronics Central
            </h2>
            <p style={{ fontSize: '16px', color: '#e0f2fe', maxWidth: '600px', lineHeight: '1.5' }}>
              Upgrade your setup with noise-cancelling headphones, OLED laptops, 4K cameras, flagship smartphones, and smartwatch wearables.
            </p>
          </div>
          <div className="electronics-icon" style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '50%', border: '2px solid rgba(56,189,248,0.4)', backdropFilter: 'blur(10px)' }}>
            <Cpu size={48} color="#38bdf8" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <section className="container" style={{ marginTop: '36px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '36px' }}>
          {[
            { key: 'all', label: 'All Tech Devices', icon: <Cpu size={16} /> },
            { key: 'audio', label: 'Audio & Sound', icon: <Headphones size={16} /> },
            { key: 'computer', label: 'Computers & Laptops', icon: <Laptop size={16} /> },
            { key: 'wearable', label: 'Smart Wearables', icon: <Watch size={16} /> },
            { key: 'photo', label: 'Cameras & Photography', icon: <Camera size={16} /> },
            { key: 'smartphone', label: 'Smartphones & Mobile', icon: <Smartphone size={16} /> }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryFilter(cat.key)}
              style={{
                padding: '10px 22px', borderRadius: '25px', border: activeCategory === cat.key ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeCategory === cat.key ? '#0284c7' : '#ffffff', color: activeCategory === cat.key ? '#ffffff' : '#334155',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: activeCategory === cat.key ? '0 4px 12px rgba(2,132,199,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            Flagship Hardware ({filteredProducts.length})
          </h2>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
            Official Brand Warranty Included
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '8px' }}>No electronics found in this category</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Try selecting another category pill above to view available tech devices.</p>
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '24px' }}>
            {filteredProducts.map(product => (
              <Link 
                to={`/product/${product.id}`} 
                className="product-card" 
                key={product.id}
                style={{
                  background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden',
                  textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'all 0.3s ease', position: 'relative'
                }}
              >
                <div className="product-image" style={{ height: '260px', background: '#f8fafc', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.discount && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--jd-red)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', zIndex: 2 }}>
                      {product.discount}
                    </span>
                  )}
                  {product.brand && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15,23,42,0.75)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                      {product.brand}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transition: 'transform 0.3s ease' }} />
                </div>

                <div className="product-info" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category Pill */}
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {product.category}
                  </span>

                  {/* Title */}
                  <h3 className="product-name" style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', lineHeight: '1.3', marginBottom: '10px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h3>

                  {/* Rating & Warranty quick info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ color: '#d97706', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={13} fill="#d97706" /> {product.ratingValue || (product.rating ? product.rating.split(' ')[0] : '4.8')}
                    </span>
                    <span>•</span>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>{product.warranty || 'Official Warranty'}</span>
                  </div>

                  {/* Price & Cart CTA */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div className="product-price" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--jd-red)' }}>
                        ${product.price.toFixed(2)}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {product.inStock !== false ? (
                      <button
                        className="add-cart"
                        title="Add to Cart"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        style={{
                          background: '#fff5f5', border: '1px solid #fecaca', color: 'var(--jd-red)',
                          width: '38px', height: '38px', borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <i className="fas fa-cart-plus" style={{ fontSize: '14px' }}></i>
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700' }}>Out of Stock</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Electronics;
