import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Star, Clock, Zap, Percent } from 'lucide-react';
import { API_BASE } from '../config/api';

const FlashDeals = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: '04',
    minutes: '59',
    seconds: '59'
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        // Filter discount/flash deal items
        const deals = data.filter(p => {
          if (!p) return false;
          if (p.discount || (p.originalPrice && p.originalPrice > p.price)) return true;
          if (p.tag && (p.tag.type === 'discount' || String(p.tag.text).toLowerCase().includes('deal') || String(p.tag.label).toLowerCase().includes('deal'))) return true;
          return false;
        });

        // Fallback to top products if deals list is small
        const finalDeals = deals.length > 0 ? deals : data.slice(0, 6);
        setProducts(finalDeals);
        setFilteredProducts(finalDeals);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch flash deals:", err);
        setLoading(false);
      });

    // Countdown Timer logic
    const endTime = new Date().getTime() + (5 * 60 * 60 * 1000); // 5 hours countdown
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance < 0) {
        clearInterval(timer);
        return;
      }
      
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft({
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCategoryFilter = (catKey) => {
    setActiveCategory(catKey);
    if (catKey === 'all') {
      setFilteredProducts(products);
    } else if (catKey === 'under200') {
      setFilteredProducts(products.filter(p => p.price <= 200));
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
          Loading Super Flash Deals & Limited Discounts...
        </div>
      </section>
    );
  }

  return (
    <div className="flash-deals-page" style={{ background: '#f8fafc', paddingBottom: '60px' }}>
      {/* Flame Red Hero Banner */}
      <div className="flash-banner" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ea580c 100%)', color: '#ffffff', padding: '50px 0', borderBottom: '3px solid #f97316', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div className="container flash-banner-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flash-banner-text">
            <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffedd5', fontSize: '12px', fontWeight: '700', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'inline-block' }}>
              LIMITED TIME PROMOTION
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '8px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔥 Super Flash Deals
            </h2>
            <p style={{ fontSize: '16px', color: '#ffedd5', maxWidth: '600px', lineHeight: '1.5' }}>
              Rock-bottom prices on premium tech and fashion products. Quantities are strictly limited!
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flash-timer" style={{ background: 'rgba(0,0,0,0.3)', padding: '18px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <span className="timer-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: '#ffedd5', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
              DEALS EXPIRE IN
            </span>
            <div className="time-blocks" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="time-block" style={{ background: '#ffffff', color: '#dc2626', fontSize: '24px', fontWeight: '800', width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {timeLeft.hours}
              </div>
              <span className="time-colon" style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>:</span>
              <div className="time-block" style={{ background: '#ffffff', color: '#dc2626', fontSize: '24px', fontWeight: '800', width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {timeLeft.minutes}
              </div>
              <span className="time-colon" style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>:</span>
              <div className="time-block" style={{ background: '#ffffff', color: '#dc2626', fontSize: '24px', fontWeight: '800', width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {timeLeft.seconds}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <section className="container" style={{ marginTop: '36px' }}>
        
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '36px' }}>
          {[
            { key: 'all', label: 'All Flash Deals' },
            { key: 'electronics', label: 'Tech Deals' },
            { key: 'fashion', label: 'Fashion Deals' },
            { key: 'under200', label: 'Deals Under $200' }
          ].map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategoryFilter(cat.key)}
              style={{
                padding: '10px 22px', borderRadius: '25px', border: activeCategory === cat.key ? '2px solid #dc2626' : '1px solid #cbd5e1',
                background: activeCategory === cat.key ? '#dc2626' : '#ffffff', color: activeCategory === cat.key ? '#ffffff' : '#334155',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: activeCategory === cat.key ? '0 4px 12px rgba(220,38,38,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="section-title" style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            Today's Top Discounted Deals ({filteredProducts.length})
          </h2>
          <span style={{ fontSize: '13px', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={16} fill="#dc2626" /> Limited Time Flash Price Cuts
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '18px', color: '#334155', marginBottom: '8px' }}>No flash deals found in this filter</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Try selecting another filter pill above to view active deals.</p>
          </div>
        ) : (
          <div className="product-grid">
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
                  <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--jd-red)', color: '#fff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', zIndex: 2, boxShadow: '0 2px 6px rgba(226,35,26,0.3)' }}>
                    {(() => {
                      if (product.discount) return product.discount;
                      const orig = product.originalPrice;
                      const curr = product.price;
                      if (orig && curr && orig > curr) {
                        return `${Math.round(((orig - curr) / orig) * 100)}% OFF`;
                      }
                      return 'FLASH DEAL';
                    })()}
                  </span>
                  {product.brand && (
                    <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15,23,42,0.75)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', backdropFilter: 'blur(4px)', zIndex: 2 }}>
                      {product.brand}
                    </span>
                  )}
                  <img src={product.image} alt={product.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain', transition: 'transform 0.3s ease' }} />
                </div>

                <div className="product-info" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Category Pill */}
                  <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    {product.category}
                  </span>

                  {/* Title */}
                  <h3 className="product-name" style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', lineHeight: '1.3', marginBottom: '10px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </h3>

                  {/* Rating & Stock Claims Bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                      <span style={{ color: '#d97706', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={13} fill="#d97706" /> {product.ratingValue || (product.rating ? product.rating.split(' ')[0] : '4.8')}
                      </span>
                      <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>82% Claimed</span>
                    </div>
                    {/* Simulated Deal Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: '#fee2e2', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #dc2626, #ea580c)', borderRadius: '3px' }}></div>
                    </div>
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

export default FlashDeals;
