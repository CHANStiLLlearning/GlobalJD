import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, QrCode, Smartphone } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function Checkout({ currentUser, clearCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('khqr');

  // If no items in state, bounce back
  const items = location.state?.items || [];
  const fromCart = location.state?.fromCart || false;

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>No items to checkout</h2>
        <Link to="/" style={{ color: 'var(--jd-red)', display: 'inline-block', marginTop: '16px' }}>Return to Homepage</Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const cartItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const tax = subtotal * 0.05; // 5% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const handlePayment = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setProcessing(true);
    setProcessingText(paymentMethod === 'khqr' ? 'Verifying KHQR transfer...' : 'Contacting your bank...');

    // Simulate payment gateway verification delay
    setTimeout(async () => {
      setProcessingText('Creating your order...');
      try {
        // Group items into a single order summary string
        const productSummary = items.map(item => `${item.quantity || 1}x ${item.name}`).join(', ');

        const orderPayload = {
          customer: currentUser.username,
          product: productSummary,
          amount: `$${total.toFixed(2)}`,
          status: 'Processing'
        };
        
        console.log('[FRONTEND CHECKOUT]: Placing combined order...', orderPayload);

        const res = await fetch(`${API_BASE}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        
        const responseData = await res.json();
        console.log('[FRONTEND CHECKOUT]: API Response:', responseData);

        if (!res.ok) {
          throw new Error(responseData.error || 'Failed to record order');
        }
        
        if (fromCart && clearCart) {
          clearCart();
        }
        
        setProcessingText('');
        setProcessing(false);
        setPaymentSuccess(true);
        
        // Redirect after success message
        setTimeout(() => {
          navigate('/my-orders');
        }, 1500);
        
      } catch (err) {
        console.error("[FRONTEND CHECKOUT ERROR]: Checkout failed:", err);
        alert(`Payment failed: ${err.message || 'Please try again.'}`);
        setProcessingText('');
        setProcessing(false);
      }
    }, 2500);
  };

  if (paymentSuccess) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <ShieldCheck size={64} color="#10b981" style={{ margin: '0 auto 24px auto' }} />
        <h2 style={{ fontSize: '32px', color: '#111827', marginBottom: '16px' }}>Payment Successful!</h2>
        <p style={{ color: '#4b5563', fontSize: '18px' }}>Your order is being processed. Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '16px' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <h1 style={{ fontSize: '28px', color: '#333', marginBottom: '32px' }}>Secure Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        
        {/* Left Col - Forms */}
        <div>
          {/* Shipping Form */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="var(--jd-red)" /> Shipping Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>First Name</label>
                <input type="text" placeholder="John" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>Last Name</label>
                <input type="text" placeholder="Doe" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>Address</label>
                <input type="text" placeholder="123 Main St" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>City</label>
                <input type="text" placeholder="New York" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>Zip Code</label>
                <input type="text" placeholder="10001" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--jd-red)" /> Payment Method
            </h3>
            
            {/* Payment Method Selector */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div 
                onClick={() => setPaymentMethod('card')}
                style={{ 
                  flex: 1, padding: '16px', border: paymentMethod === 'card' ? '2px solid var(--jd-red)' : '1px solid #d1d5db', 
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'center', 
                  background: paymentMethod === 'card' ? '#fef2f2' : '#fff', transition: 'all 0.2s'
                }}
              >
                <CreditCard size={24} color={paymentMethod === 'card' ? 'var(--jd-red)' : '#6b7280'} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: paymentMethod === 'card' ? 'bold' : 'normal', color: paymentMethod === 'card' ? 'var(--jd-red)' : '#374151' }}>Credit / Debit Card</div>
              </div>
              <div 
                onClick={() => setPaymentMethod('khqr')}
                style={{ 
                  flex: 1, padding: '16px', border: paymentMethod === 'khqr' ? '2px solid var(--jd-red)' : '1px solid #d1d5db', 
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'center', 
                  background: paymentMethod === 'khqr' ? '#fef2f2' : '#fff', transition: 'all 0.2s'
                }}
              >
                <QrCode size={24} color={paymentMethod === 'khqr' ? 'var(--jd-red)' : '#6b7280'} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: paymentMethod === 'khqr' ? 'bold' : 'normal', color: paymentMethod === 'khqr' ? 'var(--jd-red)' : '#374151' }}>KHQR / Bank App</div>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              {paymentMethod === 'card' ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '16px' }} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength="5" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '4px' }}>CVV</label>
                      <input type="text" placeholder="123" maxLength="4" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} required />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '24px', padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '16px' }}>Scan with ABA, ACLEDA, or any KHQR App</h4>
                  <div style={{ background: '#fff', display: 'inline-block', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '16px' }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KHQR_PAY_${total.toFixed(2)}`} alt="KHQR Code" style={{ width: '150px', height: '150px' }} />
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Smartphone size={16} /> Open your banking app to scan and pay
                  </div>
                </div>
              )}
              
              <button 
                type="submit"
                disabled={processing}
                style={{ 
                  width: '100%', padding: '16px', background: 'var(--jd-red)', color: '#fff', 
                  border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold',
                  cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1,
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                {processing ? (
                  <>{processingText}</>
                ) : paymentMethod === 'khqr' ? (
                  <><ShieldCheck size={20} /> I have paid ${total.toFixed(2)} via KHQR</>
                ) : (
                  <><ShieldCheck size={20} /> Pay ${total.toFixed(2)}</>
                )}
              </button>
              <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '12px' }}>
                <i className="fas fa-lock"></i> SSL Secured Payment
              </p>
            </form>
          </div>
        </div>

        {/* Right Col - Order Summary */}
        <div>
          <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #eaeaea', padding: '24px', position: 'sticky', top: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', paddingBottom: '16px', borderBottom: '1px solid #eaeaea' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#f9f9f9', borderRadius: '4px' }} />
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#64748b', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      {item.quantity || 1}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                    <div style={{ color: '#e1251b', fontWeight: 'bold', fontSize: '14px' }}>${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
              <span>Subtotal ({cartItemCount} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
              <span>Tax (5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#666' }}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? '#10b981' : '#666' }}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eaeaea', fontSize: '20px', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: '#e1251b' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
