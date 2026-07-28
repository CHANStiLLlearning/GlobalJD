import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart({ currentUser, cartItems, updateQuantity, removeFromCart, clearCart }) {
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;
    navigate('/checkout', { state: { items: cartItems, fromCart: true } });
  };

  return (
    <>
    <style>{`
      /* ===== Cart Page — Mobile Responsive ===== */
      .cart-page { padding: 40px 20px; min-height: 60vh; }
      .cart-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
      }
      .cart-items-col { order: 2; }
      .cart-summary-col { order: 1; }
      .cart-item-row {
        background: #fff;
        border-radius: 8px;
        border: 1px solid #eaeaea;
        padding: 16px;
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .cart-item-img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        background: #f9f9f9;
        border-radius: 4px;
        flex-shrink: 0;
      }
      .cart-item-info { flex: 1; min-width: 0; }
      .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-shrink: 0;
      }
      .cart-remove-text { display: inline; }
      .cart-summary-sticky { position: sticky; top: 24px; }

      @media (max-width: 768px) {
        .cart-page { padding: 20px 16px; }
        .cart-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        .cart-items-col { order: 2 !important; }
        .cart-summary-col { order: 1 !important; }
        .cart-summary-sticky { position: static !important; }
        .cart-item-row { flex-wrap: wrap; gap: 12px; }
        .cart-item-controls {
          width: 100%;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
          margin-top: 4px;
        }
        .cart-title { font-size: 22px !important; margin-bottom: 20px !important; }
      }

      @media (max-width: 480px) {
        .cart-page { padding: 16px 12px; }
        .cart-item-img { width: 64px !important; height: 64px !important; }
        .cart-title { font-size: 20px !important; }
        .cart-remove-text { display: none; }
      }
    `}</style>

    <div className="container cart-page">
      {/* Back Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <h1 className="cart-title" style={{ fontSize: '28px', color: '#333', marginBottom: '32px' }}>
        Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea' }}>
          <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#666', marginBottom: '16px' }}>Your cart is empty.</h3>
          <Link to="/" style={{ display: 'inline-block', background: '#e1251b', color: '#fff', padding: '10px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-grid">

          {/* LEFT: Cart Items */}
          <div className="cart-items-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => {
              const identifier = item.id || item.name;
              return (
                <div key={identifier} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '15px', lineHeight: '1.4' }}>{item.name}</h4>
                    <div style={{ color: '#e1251b', fontWeight: 'bold', fontSize: '17px' }}>${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>${item.price.toFixed(2)} each</div>
                  </div>

                  {/* Qty + Remove */}
                  <div className="cart-item-controls">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <button
                        onClick={() => updateQuantity(identifier, -1)}
                        disabled={(item.quantity || 1) <= 1}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 8px', fontSize: '18px', fontWeight: 'bold', color: '#475569', opacity: (item.quantity || 1) <= 1 ? 0.3 : 1, lineHeight: 1 }}
                      >−</button>
                      <span style={{ fontWeight: '700', fontSize: '15px', minWidth: '24px', textAlign: 'center' }}>{item.quantity || 1}</span>
                      <button
                        onClick={() => updateQuantity(identifier, 1)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px 8px', fontSize: '18px', fontWeight: 'bold', color: '#475569', lineHeight: 1 }}
                      >+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(identifier)}
                      style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600' }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                      <span className="cart-remove-text">Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Order Summary */}
          <div className="cart-summary-col">
            <div className="cart-summary-sticky" style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', paddingBottom: '16px', borderBottom: '1px solid #eaeaea' }}>Order Summary</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
                <span>Subtotal ({cartItemCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
                <span>Shipping</span>
                <span style={{ color: '#10b981' }}>Free</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eaeaea', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: '#e1251b' }}>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  width: '100%', padding: '14px', background: '#e1251b', color: '#fff',
                  border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold',
                  marginTop: '24px', cursor: checkingOut ? 'not-allowed' : 'pointer', opacity: checkingOut ? 0.7 : 1
                }}
              >
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>

              <button
                onClick={clearCart}
                style={{
                  width: '100%', padding: '12px', background: 'transparent', color: '#64748b',
                  border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', fontWeight: '500',
                  marginTop: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Trash2 size={16} /> Empty Cart
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
    </>
  );
}
