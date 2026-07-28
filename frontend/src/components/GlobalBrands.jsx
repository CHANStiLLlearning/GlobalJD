import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config/api';

const GlobalBrands = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    // Fetch products
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        // Filter for Best Sellers
        const brandItems = data.filter(p => p.tag && p.tag.type === 'bestseller');
        setProducts(brandItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="container" style={{ minHeight: '50vh', padding: '40px 0', textAlign: 'center' }}>
        <h2>Loading Global Brands...</h2>
      </section>
    );
  }

  return (
    <div className="global-brands-page">
      {/* Banner */}
      <div className="global-banner">
        <div className="container global-banner-inner">
          <div className="global-banner-text">
            <h2>🌍 Global Brands</h2>
            <p>Experience world-class quality with our all-time best-selling products.</p>
          </div>
          <div className="global-icon">
            <i className="fas fa-crown"></i>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="container" style={{ marginTop: '40px' }}>
        <h2 className="section-title">Premium Best Sellers</h2>
        
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>No global brands available right now.</div>
        ) : (
          <div className="product-grid">
              {products.map(product => (
                <Link to={`/product/${product.id}`} className="product-card" key={product.id}>
                    <div className="product-image">
                        {product.tag && (
                            <span className={`product-tag tag-${product.tag.type}`}>
                                {product.tag.label}
                            </span>
                        )}
                        <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-info">
                        <div className="product-price"><span>$</span>{product.price.toFixed(2)}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-meta">
                          <span>{product.rating}</span>
                          {product.inStock !== false ? (
                            <div 
                              className="add-cart" 
                              title="Add to Cart"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart(product);
                              }}
                            >
                              <i className="fas fa-cart-plus"></i>
                            </div>
                          ) : (
                            <div className="out-of-stock-label" style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>
                              Out of Stock
                            </div>
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

export default GlobalBrands;
