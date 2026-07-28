import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config/api';

export default function MyOrders({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const fetchUserOrders = () => {
    if (currentUser) {
      fetch(`${API_BASE}/api/orders?username=${currentUser.username}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLastSync(new Date());
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch orders:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUserOrders();

    // Setup 3-second realtime auto-sync polling
    const timer = setInterval(() => {
      fetchUserOrders();
    }, 3000);

    return () => clearInterval(timer);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Please log in to view your orders.</h2>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <span style={{ fontSize: '12px', color: '#16a34a', background: '#dcfce7', padding: '4px 12px', borderRadius: '14px', fontWeight: '700', border: '1px solid #86efac' }}>
          ● Realtime Order Tracking Active (Last Synced: {lastSync.toLocaleTimeString()})
        </span>
      </div>

      <h1 style={{ fontSize: '28px', color: '#0f172a', fontWeight: '800', marginBottom: '32px' }}>My Orders</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your recent purchases...</div>
      ) : orders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '60px 20px', background: '#fff', 
          borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' 
        }}>
          <Package size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#334155', marginBottom: '16px', fontSize: '20px' }}>You haven't placed any orders yet.</h3>
          <Link to="/" style={{ 
            display: 'inline-block', background: 'var(--jd-red)', color: '#fff', 
            padding: '12px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700' 
          }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order, index) => {
            const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
            const currentStepIdx = 
              order.status === 'Delivered' || order.status === 'Completed' ? 3 :
              order.status === 'Shipped' ? 2 :
              order.status === 'Processing' ? 1 : 0;

            return (
              <div key={index} style={{ 
                background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', 
                padding: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', fontFamily: 'monospace' }}>Order ID: {order.id}</div>
                    <h3 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>{order.product}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--jd-red)' }}>{order.amount}</div>
                    <button 
                      onClick={() => { setSelectedOrder(order); setIsInvoiceOpen(true); }}
                      style={{ 
                        marginTop: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 14px', 
                        borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155'
                      }}>
                      View Invoice
                    </button>
                  </div>
                </div>

                {/* Realtime Progress Timeline Tracker */}
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Connecting line */}
                    <div style={{ 
                      position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', 
                      background: '#e2e8f0', zIndex: 1 
                    }}>
                      <div style={{ 
                        height: '100%', background: '#10b981', 
                        width: `${(currentStepIdx / 3) * 100}%`, transition: 'width 0.4s ease' 
                      }}></div>
                    </div>

                    {steps.map((step, sIdx) => {
                      const isDone = sIdx <= currentStepIdx;
                      return (
                        <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                          <div style={{ 
                            width: '28px', height: '28px', borderRadius: '50%', 
                            background: isDone ? '#10b981' : '#e2e8f0', 
                            color: isDone ? '#fff' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 'bold', fontSize: '12px', border: '3px solid #fff'
                          }}>
                            {isDone ? '✓' : sIdx + 1}
                          </div>
                          <span style={{ 
                            fontSize: '12px', marginTop: '6px', fontWeight: isDone ? '700' : '400', 
                            color: isDone ? '#047857' : '#94a3b8' 
                          }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceOpen && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#fff', width: '500px', maxWidth: '95%', borderRadius: '12px', 
            padding: '40px', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setIsInvoiceOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' }}
            >
              &times;
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--jd-red)', fontSize: '24px' }}>JD<span style={{ color: '#333' }}>GLOBAL</span></h2>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>Premium E-commerce</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, color: '#333' }}>INVOICE</h3>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>{selectedOrder.id}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Billed To:</p>
                <p style={{ margin: 0, color: '#333', fontWeight: '500', textTransform: 'capitalize' }}>{selectedOrder.customer}</p>
                <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>Global Customer</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Date Issued:</p>
                <p style={{ margin: 0, color: '#333', fontWeight: '500' }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', color: '#666', fontSize: '14px' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '8px 0', color: '#666', fontSize: '14px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '16px 0', color: '#333', fontWeight: '500' }}>{selectedOrder.product}</td>
                  <td style={{ padding: '16px 0', textAlign: 'right', color: '#333' }}>{selectedOrder.amount}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                  <span>Subtotal</span>
                  <span>{selectedOrder.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666', fontSize: '14px' }}>
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #e5e7eb', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Total</span>
                  <span>{selectedOrder.amount}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <button 
                onClick={() => window.print()}
                style={{ background: '#e1251b', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <i className="fas fa-print" style={{ marginRight: '8px' }}></i> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
