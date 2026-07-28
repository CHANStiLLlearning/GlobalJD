import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';

const ProductGrid = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="container" style={{ padding: '40px 15px' }}>
        <h2 className="section-title">Recommended For You</h2>
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading premium products catalog...</div>
      </section>
    );
  }

  // Extract unique categories
  const rawCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const categories = ['All', ...rawCategories];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <section className="container" style={{ padding: '20px 15px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 className="section-title" style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            {selectedCategory === 'All' 
              ? 'Featured Recommendations' 
              : `${selectedCategory.toUpperCase()} COLLECTION`}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Filter by specific category department to view top authentic products
          </p>
        </div>
        
        {/* Category Pills Bar */}
        <div className="product-filter" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
          {categories.map(category => {
            const count = category === 'All' ? products.length : products.filter(p => p.category === category).length;
            return (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                  border: selectedCategory === category ? '2px solid var(--jd-red)' : '1px solid #cbd5e1',
                  background: selectedCategory === category ? 'var(--jd-red)' : '#ffffff',
                  color: selectedCategory === category ? '#ffffff' : '#334155',
                  cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: selectedCategory === category ? '0 4px 12px rgba(226,35,26,0.25)' : 'none'
                }}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
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
                      <img src={product.image} alt={product.name} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                  </div>
                  <div className="product-info" style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                        {product.category}
                      </span>
                      <div className="product-name" style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b', lineHeight: '1.3', marginBottom: '10px', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {product.name}
                      </div>
                      <div className="product-meta" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div className="product-price" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--jd-red)' }}>
                              <span>$</span>{product.price.toFixed(2)}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                                ${product.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {product.inStock !== false ? (
                            <div 
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
                            </div>
                          ) : (
                            <div className="out-of-stock-label" style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold' }}>
                              Out of Stock
                            </div>
                          )}
                      </div>
                  </div>
              </Link>
            ))}
        </div>
    </section>
  );
};

export default ProductGrid;
