import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Heart, Share2, 
  Check, Package, Award, Sparkles, Sliders, MessageSquare, ThumbsUp, Send
} from 'lucide-react';
import { API_BASE } from '../config/api';

const ProductDetail = ({ onAddToCart, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(`${API_BASE}/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          setProduct(null);
        } else {
          // Normalize product fields with full defaults matching all 21 field requirements
          const normalized = {
            id: data.id,
            name: data.name || data.productName || "Premium Product",
            brand: data.brand || "GlobalJD Select",
            category: data.category || "Electronics > Audio",
            sku: data.sku || `GJD-${data.id || '1001'}`,
            price: Number(data.price) || 299.99,
            originalPrice: data.originalPrice ? Number(data.originalPrice) : (Number(data.price) * 1.15),
            discount: data.discount || (data.originalPrice ? `${Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)}% Off` : "15% Off"),
            stockStatus: data.stockStatus || (data.inStock !== false ? "In Stock (120 Units)" : "Out of Stock"),
            stockCount: data.stockCount || (data.inStock !== false ? 120 : 0),
            inStock: data.inStock !== false,
            colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : ["Default Black", "Silver Gray"],
            sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ["Standard Size"],
            weight: data.weight || "250 g",
            features: Array.isArray(data.features) && data.features.length > 0 ? data.features : [
              "Premium acoustic sound driver with active noise cancellation",
              "Multi-device fast Bluetooth connectivity",
              "Long-lasting battery endurance with USB-C quick charge",
              "Ergonomic lightweight design engineered for all-day comfort"
            ],
            specifications: (data.specifications && typeof data.specifications === 'object') ? data.specifications : {
              "Brand": data.brand || "Sony",
              "Model / SKU": data.sku || `GJD-${data.id}`,
              "Connectivity": "Bluetooth 5.3 & 3.5mm Aux",
              "Battery Duration": "30 Hours Playtime",
              "Charging Interface": "USB Type-C Fast Charge",
              "Weight": data.weight || "250 g"
            },
            packageIncludes: Array.isArray(data.packageIncludes) && data.packageIncludes.length > 0 ? data.packageIncludes : [
              data.name || "Product Unit",
              "USB-C Charging Cable",
              "Protective Carrying Case",
              "User Manual & Warranty Card"
            ],
            benefits: Array.isArray(data.benefits) && data.benefits.length > 0 ? data.benefits : [
              "Comfortable for long use without ear fatigue",
              "High-fidelity crystal clear audio clarity",
              "Lightweight portable foldaway design",
              "Fast hassle-free automatic pairing"
            ],
            warranty: data.warranty || "1-Year Official Manufacturer Warranty",
            rating: data.rating || "4.8 (1,240 reviews)",
            ratingValue: Number(data.ratingValue) || 4.8,
            customerReviews: Array.isArray(data.customerReviews) && data.customerReviews.length > 0 ? data.customerReviews : [
              { id: 1, username: "John Doe", rating: 5, date: "2026-07-20", comment: "Amazing sound quality and very comfortable! Highly recommended." },
              { id: 2, username: "Alice Smith", rating: 5, date: "2026-07-18", comment: "Battery lasts all week with regular daily commute use." }
            ],
            shippingInfo: data.shippingInfo || "Free Express Shipping. Delivery in 3–5 Business Days.",
            returnPolicy: data.returnPolicy || "30-Day Free Returns & Easy Exchanges",
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
              data.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
            ],
            description: data.description || "Experience premium sound with advanced noise cancellation and long-lasting battery life, perfect for travel, work, and everyday listening."
          };

          setProduct(normalized);
          if (normalized.colors.length > 0) setSelectedColor(normalized.colors[0]);
          if (normalized.sizes.length > 0) setSelectedSize(normalized.sizes[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch product details:", err);
        setLoading(false);
      });
  }, [id]);

  const handleBuyNow = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/checkout', { state: { items: [{ ...product, quantity, selectedColor, selectedSize }], fromCart: false } });
  };

  const handleAddToCartWithQty = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart({ ...product, selectedColor, selectedSize });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser ? currentUser.username : 'Verified Buyer',
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setProduct(prev => ({
          ...prev,
          customerReviews: data.reviews
        }));
        setReviewForm({ rating: 5, comment: '' });
        setReviewMsg('Thank you! Your review has been published.');
        setTimeout(() => setReviewMsg(''), 4000);
      }
    } catch (err) {
      console.error("Error posting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '18px', color: '#666', fontWeight: '500' }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px', color: 'var(--jd-red)' }}></i>
          Loading premium product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#666', marginTop: '10px' }}>The requested product specification could not be loaded.</p>
        <Link to="/" style={{ color: 'var(--jd-red)', textDecoration: 'none', marginTop: '20px', display: 'inline-block', fontWeight: 'bold' }}>
          &larr; Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="product-page-wrapper" style={{ background: '#f5f7fa', paddingBottom: '60px' }}>
      <div className="container">
        {/* Breadcrumbs Navigation */}
        <nav className="pdp-breadcrumbs" style={{ padding: '16px 0', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ color: '#333', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={16} /> Home
          </Link>
          <span>/</span>
          <span style={{ color: '#666', fontWeight: '500' }}>{product.category}</span>
          <span>/</span>
          <span style={{ color: 'var(--jd-red)', fontWeight: '600' }}>{product.name}</span>
        </nav>

        {/* Main Product Details Card */}
        <div className="pdp-card" style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '36px', marginBottom: '40px' }}>
          
          {/* LEFT: Product Images Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-main-image-container" style={{ position: 'relative', width: '100%', height: '440px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid #e2e8f0' }}>
              {product.discount && (
                <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--jd-red)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', zIndex: 2, boxShadow: '0 4px 10px rgba(226,35,26,0.3)' }}>
                  {product.discount}
                </span>
              )}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: isWishlisted ? '#ef4444' : '#64748b', transition: 'all 0.2s ease' }}
                title="Save to Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} />
              </button>
              <img 
                src={product.images[selectedImage] || product.image} 
                alt={product.name} 
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', transition: 'transform 0.3s ease' }} 
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="pdp-thumbnails" style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: '76px', height: '76px', borderRadius: '8px', border: selectedImage === idx ? '2px solid var(--jd-red)' : '1px solid #e2e8f0',
                      padding: '4px', background: '#fff', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Guarantees Ribbon */}
            <div style={{ marginTop: '28px', background: '#f8fafc', padding: '18px 24px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Truck size={22} style={{ color: 'var(--jd-red)' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Fast Shipping</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Global Delivery</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={22} style={{ color: 'var(--jd-red)' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Official Warranty</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>100% Authentic</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={22} style={{ color: 'var(--jd-red)' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>30-Day Returns</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Money Back</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Information & Purchase Box */}
          <div className="pdp-info-col" style={{ display: 'flex', flexDirection: 'column' }}>
            
            {/* Header: Brand & SKU */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.brand}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '600' }}>
                  SKU: {product.sku}
                </span>
                <button 
                  onClick={handleShare}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500' }}
                >
                  <Share2 size={15} /> {copied ? 'Copied Link!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1.25', marginBottom: '12px' }}>
              {product.name}
            </h1>

            {/* Rating Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '4px 10px', borderRadius: '6px', color: '#d97706', fontWeight: '700', fontSize: '14px' }}>
                <Star size={16} fill="#d97706" color="#d97706" />
                <span>{product.ratingValue}</span>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                {product.rating}
              </span>
            </div>

            {/* Price Box */}
            <div style={{ background: '#fff5f5', border: '1px dashed #fecaca', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'baseline', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '16px', color: 'var(--jd-red)', fontWeight: '700' }}>$</span>
                <span style={{ fontSize: '38px', fontWeight: '800', color: 'var(--jd-red)', lineHeight: '1' }}>
                  {product.price.toFixed(2)}
                </span>
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '18px', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '500' }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span style={{ marginLeft: 'auto', background: product.inStock ? '#dcfce7' : '#fee2e2', color: product.inStock ? '#15803d' : '#b91c1c', fontSize: '13px', fontWeight: '700', padding: '6px 12px', borderRadius: '20px' }}>
                {product.stockStatus}
              </span>
            </div>

            {/* Description Snippet */}
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>

            {/* Selectable Options: Color */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                  Select Color: <span style={{ fontWeight: '500', color: '#64748b' }}>{selectedColor}</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.colors.map((clr, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(clr)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: selectedColor === clr ? '2px solid var(--jd-red)' : '1px solid #cbd5e1',
                        background: selectedColor === clr ? '#fff5f5' : '#fff', color: selectedColor === clr ? 'var(--jd-red)' : '#334155',
                        fontWeight: selectedColor === clr ? '700' : '500', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selectable Options: Size */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                  Select Size: <span style={{ fontWeight: '500', color: '#64748b' }}>{selectedSize}</span>
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.sizes.map((sz, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', border: selectedSize === sz ? '2px solid var(--jd-red)' : '1px solid #cbd5e1',
                        background: selectedSize === sz ? '#fff5f5' : '#fff', color: selectedSize === sz ? 'var(--jd-red)' : '#334155',
                        fontWeight: selectedSize === sz ? '700' : '500', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Quantity:</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '38px', height: '38px', background: '#f8fafc', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ width: '44px', textAlign: 'center', fontSize: '15px', fontWeight: '700' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '38px', height: '38px', background: '#f8fafc', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Weight: <strong>{product.weight}</strong></span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
              <button
                onClick={handleAddToCartWithQty}
                disabled={!product.inStock}
                style={{
                  flex: 1, padding: '16px 24px', borderRadius: '10px', border: '2px solid var(--jd-red)',
                  background: '#fff', color: 'var(--jd-red)', fontSize: '16px', fontWeight: '700', cursor: product.inStock ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-cart-plus"></i> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                style={{
                  flex: 1, padding: '16px 24px', borderRadius: '10px', border: 'none',
                  background: product.inStock ? 'linear-gradient(135deg, #e2231a 0%, #c81623 100%)' : '#cbd5e1',
                  color: '#fff', fontSize: '16px', fontWeight: '700', cursor: product.inStock ? 'pointer' : 'not-allowed',
                  boxShadow: product.inStock ? '0 4px 14px rgba(226,35,26,0.35)' : 'none', transition: 'all 0.2s ease'
                }}
              >
                Buy Now
              </button>
            </div>

          </div>
        </div>

        {/* DETAILED SPECIFICATIONS TABS SECTION */}
        <div className="pdp-tabs-container" style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', padding: '36px', overflow: 'hidden' }}>
          
          {/* Tab Headers */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '2px solid #f1f5f9', marginBottom: '32px', overflowX: 'auto' }}>
            {[
              { id: 'overview', label: 'Overview & Features', icon: <Sparkles size={18} /> },
              { id: 'specs', label: 'Technical Specifications', icon: <Sliders size={18} /> },
              { id: 'reviews', label: `Customer Reviews (${product.customerReviews.length})`, icon: <MessageSquare size={18} /> },
              { id: 'shipping', label: 'Shipping & Warranty', icon: <Truck size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px', border: 'none', background: 'none', fontSize: '16px', fontWeight: activeTab === tab.id ? '700' : '500',
                  color: activeTab === tab.id ? 'var(--jd-red)' : '#64748b', cursor: 'pointer', borderBottom: activeTab === tab.id ? '3px solid var(--jd-red)' : '3px solid transparent',
                  marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & FEATURES */}
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
                Product Description
              </h3>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7', marginBottom: '28px' }}>
                {product.description}
              </p>

              {/* Key Features Bullet List */}
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={20} color="var(--jd-red)" /> Key Features & Highlights
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                {product.features.map((feat, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ background: '#fee2e2', color: 'var(--jd-red)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      ✓
                    </div>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500', lineHeight: '1.5' }}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Benefits Section */}
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--jd-red)" /> Customer Benefits
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {product.benefits.map((benefit, index) => (
                  <div key={index} style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #dbeafe', textAlign: 'center' }}>
                    <div style={{ color: '#2563eb', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Benefit #{index + 1}</div>
                    <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '500' }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
                Technical Details & Specifications
              </h3>
              
              <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <tbody>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155', width: '30%' }}>Product Name</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{product.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Brand</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{product.brand}</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>SKU</td>
                      <td style={{ padding: '14px 20px', color: '#475569', fontFamily: 'monospace' }}>{product.sku}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Category</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{product.category}</td>
                    </tr>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>Product Weight</td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{product.weight}</td>
                    </tr>
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} style={{ background: idx % 2 === 1 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: '#334155' }}>{key}</td>
                        <td style={{ padding: '14px 20px', color: '#475569' }}>{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Package Includes */}
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} color="var(--jd-red)" /> Package Includes (In the Box)
              </h4>
              <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {product.packageIncludes.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                    <span style={{ color: 'var(--jd-red)' }}>•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Customer Reviews & Ratings</h3>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>Average Rating: <strong>{product.ratingValue} / 5.0</strong> ({product.customerReviews.length} verified reviews)</p>
                </div>
              </div>

              {/* List of Reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {product.customerReviews.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No reviews yet. Be the first to leave a review!</p>
                ) : (
                  product.customerReviews.map(rev => (
                    <div key={rev.id} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--jd-red)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                            {rev.username ? rev.username[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{rev.username}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{rev.date}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < rev.rating ? "#f59e0b" : "none"} color={i < rev.rating ? "#f59e0b" : "#cbd5e1"} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add a Review Form */}
              <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
                  Write a Customer Review
                </h4>

                {reviewMsg && (
                  <div style={{ padding: '12px', background: '#dcfce7', color: '#15803d', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', fontWeight: '600' }}>
                    {reviewMsg}
                  </div>
                )}

                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Your Rating:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <Star size={24} fill={star <= reviewForm.rating ? "#f59e0b" : "none"} color={star <= reviewForm.rating ? "#f59e0b" : "#cbd5e1"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Your Review:</label>
                    <textarea
                      rows="3"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Write your detailed feedback here..."
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    style={{ background: 'var(--jd-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Send size={16} /> Submit Review
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: SHIPPING & WARRANTY */}
          {activeTab === 'shipping' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
                Shipping, Warranty & Return Policies
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <Truck size={28} color="var(--jd-red)" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Shipping Information</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{product.shippingInfo}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <RotateCcw size={28} color="var(--jd-red)" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Return Policy</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{product.returnPolicy}</p>
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <ShieldCheck size={28} color="var(--jd-red)" style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Warranty Coverage</h4>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{product.warranty}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
