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
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '32px' }}>Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '60px 20px', background: '#fff', 
          borderRadius: '8px', border: '1px solid #eaeaea' 
        }}>
          <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#666', marginBottom: '16px' }}>Your cart is empty.</h3>
          <Link to="/" style={{ 
            display: 'inline-block', background: '#e1251b', color: '#fff', 
            padding: '10px 24px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cartItems.map((item) => (
              <div key={item.id} style={{ 
                background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', 
                padding: '16px', display: 'flex', gap: '16px', alignItems: 'center'
              }}>
                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{item.name}</h4>
                  <div style={{ color: '#e1251b', fontWeight: 'bold', fontSize: '18px' }}>${item.price.toFixed(2)}</div>
                </div>
                
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={(item.quantity || 1) <= 1}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', fontSize: '16px', color: '#475569', opacity: (item.quantity || 1) <= 1 ? 0.3 : 1 }}
                  >-</button>
                  <span style={{ fontWeight: '600', fontSize: '14px', width: '20px', textAlign: 'center' }}>{item.quantity || 1}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 8px', fontSize: '16px', color: '#475569' }}
                  >+</button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove Item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ 
              background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', 
              padding: '24px', position: 'sticky', top: '24px'
            }}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
