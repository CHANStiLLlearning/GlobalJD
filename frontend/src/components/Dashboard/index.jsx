import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Package, Tags, Grid, CheckCircle, XCircle, RefreshCw, Radio, Wifi, WifiOff } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import FlashDealsAdmin from './FlashDealsAdmin';
import NewArrivalsAdmin from './NewArrivalsAdmin';
import ElectronicsAdmin from './ElectronicsAdmin';
import FashionAdmin from './FashionAdmin';
import GlobalBrandsAdmin from './GlobalBrandsAdmin';
import SettingsAdmin from './SettingsAdmin';
import CustomersAdmin from './CustomersAdmin';
import ProductsAdmin from './ProductsAdmin';
import CustomItemsAdmin from './CustomItemsAdmin';
import { API_BASE } from '../../config/api';
import { supabase } from '../../config/supabase';
import './Dashboard.css';

export default function Dashboard({ setCurrentUser }) {
  const [activeMenu, setActiveMenu] = useState('overview');

  const [timeFilter, setTimeFilter] = useState('7days');
  const [analysisTime, setAnalysisTime] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Format date helper
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const [realtimeStatus, setRealtimeStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const channelRef = useRef(null);

  const fetchOverviewData = (isManual = false) => {
    if (isManual) setIsRefreshing(true);

    fetch(`${API_BASE}/api/admin/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('[FRONTEND DASHBOARD API RESPONSE]:', data);

        const statsData = data.stats || {};
        const ordersData = Array.isArray(data.recentOrders) ? data.recentOrders : [];

        const dynamicStats = [
          { title: "Total Products", value: statsData.totalProducts || 0, icon: <Package size={24} />, trend: "Active Catalog", color: "#3b82f6" },
          { title: "In Stock Items", value: statsData.inStockCount || 0, icon: <CheckCircle size={24} />, trend: `${statsData.inStockCount || 0} available`, color: "#10b981" },
          { title: "Out of Stock", value: statsData.outOfStockCount || 0, icon: <XCircle size={24} />, trend: (statsData.outOfStockCount || 0) > 0 ? `${statsData.outOfStockCount} restock needed` : "All in stock", color: (statsData.outOfStockCount || 0) > 0 ? "#ef4444" : "#6b7280" },
          { title: "Total Orders", value: statsData.totalOrders !== undefined ? statsData.totalOrders : ordersData.length, icon: <Radio size={24} />, trend: "Live Database", color: "#8b5cf6" },
          { title: "Revenue (Est.)", value: typeof statsData.totalRevenue === 'number' ? `$${statsData.totalRevenue.toFixed(2)}` : (statsData.totalRevenue || "$0.00"), icon: <DollarSign size={24} />, trend: "Realtime Sync", color: "#10b981" },
          { title: "Active Customers", value: statsData.totalCustomers || 1, icon: <Tags size={24} />, trend: "Registered Users", color: "#f97316" }
        ];

        setStats(dynamicStats);
        setRecentOrders(ordersData);
        setAnalysisTime(new Date().toLocaleTimeString());
        setLastSyncTime(new Date());
        setLoading(false);
        if (isManual) setTimeout(() => setIsRefreshing(false), 500);
      })
      .catch(err => {
        console.error("Failed to fetch /api/admin/dashboard, falling back to /api/orders:", err);
        fetch(`${API_BASE}/api/orders`)
          .then(res => res.json())
          .then(orders => {
            if (Array.isArray(orders)) {
              setRecentOrders(orders);
            }
            setLoading(false);
            if (isManual) setIsRefreshing(false);
          })
          .catch(e => {
            console.error("Fallback order fetch failed:", e);
            setLoading(false);
            if (isManual) setIsRefreshing(false);
          });
      });
  };

  // Setup Supabase Realtime subscription — instant push on any orders table change
  useEffect(() => {
    if (activeMenu !== 'overview') return;

    // Initial data load
    fetchOverviewData();

    // Subscribe to Supabase Realtime on the orders table
    const channel = supabase
      .channel('dashboard-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[REALTIME] orders table changed:', payload.eventType, payload.new || payload.old);
          // Immediately refetch full dashboard stats when any order changes
          fetchOverviewData();
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] subscription status:', status);
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('disconnected');
        else setRealtimeStatus('connecting');
      });

    channelRef.current = channel;

    return () => {
      // Cleanup subscription on unmount or menu change
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeMenu, timeFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const cleanId = String(orderId).replace('#', '');
      await fetch(`${API_BASE}/api/orders/${cleanId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      // Optimistic update
      setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} setCurrentUser={setCurrentUser} />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Navbar */}
        <TopNav />

        {/* Dynamic Content Area */}
        {activeMenu === 'products' ? (
          <ProductsAdmin />
        ) : activeMenu === 'flash-deals' ? (
          <FlashDealsAdmin />
        ) : activeMenu === 'new-arrivals' ? (
          <NewArrivalsAdmin />
        ) : activeMenu === 'electronics' ? (
          <ElectronicsAdmin />
        ) : activeMenu === 'fashion' ? (
          <FashionAdmin />
        ) : activeMenu === 'global-brands' ? (
          <GlobalBrandsAdmin />
        ) : activeMenu === 'customers' ? (
          <CustomersAdmin />
        ) : activeMenu === 'custom-items' ? (
          <CustomItemsAdmin />
        ) : activeMenu === 'settings' ? (
          <SettingsAdmin />
        ) : (
          <div className="dashboard-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  Dashboard Overview
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: realtimeStatus === 'connected' ? '#dcfce7' : realtimeStatus === 'disconnected' ? '#fee2e2' : '#fef9c3',
                    color: realtimeStatus === 'connected' ? '#15803d' : realtimeStatus === 'disconnected' ? '#dc2626' : '#b45309',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                    border: `1px solid ${realtimeStatus === 'connected' ? '#86efac' : realtimeStatus === 'disconnected' ? '#fca5a5' : '#fde68a'}`
                  }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: realtimeStatus === 'connected' ? '#16a34a' : realtimeStatus === 'disconnected' ? '#dc2626' : '#d97706',
                      boxShadow: realtimeStatus === 'connected' ? '0 0 0 3px rgba(22,163,74,0.3)' : 'none',
                      animation: realtimeStatus !== 'disconnected' ? 'pulse 1.5s infinite' : 'none'
                    }}></span>
                    {realtimeStatus === 'connected' ? '⚡ LIVE REALTIME' : realtimeStatus === 'disconnected' ? '✕ DISCONNECTED' : '◌ CONNECTING...'}
                  </span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                  Live auto-updating via Supabase WebSocket — instant push when orders are placed.
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', fontWeight: '500' }}>
                  Last Synced: {lastSyncTime.toLocaleTimeString()} · Supabase WebSocket
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => fetchOverviewData(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff',
                    color: '#475569', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  title="Manual Sync"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'fa-spin' : ''} />
                  {isRefreshing ? 'Syncing...' : 'Sync Now'}
                </button>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{
                    padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    backgroundColor: '#fff', fontSize: '14px', outline: 'none', cursor: 'pointer',
                    fontWeight: '600', color: '#334155'
                  }}
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading live overview data...</div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  {stats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                      <div className="stat-card-header">
                        <h3>{stat.title}</h3>
                        <div className="stat-icon-wrapper" style={{ color: stat.color }}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className="stat-card-body">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-trend">
                          <span className="trend-up" style={{ color: stat.color }}>{stat.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sales & Inventory Analytics Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Category Inventory Share</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(() => {
                        const categoryColors = { electronics: '#3b82f6', fashion: '#d946ef', default: '#10b981' };
                        const totalProd = (stats.find(s => s.title === "Total Products")?.value) || 10;
                        
                        return Object.entries({ Electronics: 55, Fashion: 45 }).map(([cat, pct], idx) => {
                          const col = categoryColors[cat.toLowerCase()] || categoryColors.default;
                          return (
                            <div key={idx}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '600', color: '#334155' }}>{cat} Department</span>
                                <span style={{ color: col, fontWeight: '700' }}>{pct}%</span>
                              </div>
                              <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                                <div style={{ background: col, width: `${pct}%`, height: '100%', borderRadius: '6px' }}></div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Top Performing Products</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: '#fee2e2', color: '#dc2626', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Sony WH-1000XM5 Wireless Headphones</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>Active Catalog</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: '#e0e7ff', color: '#3730a3', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Coach Gallery Tote Bag in Crossgrain Leather</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>Active Catalog</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: '#fef3c7', color: '#b45309', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Classic Merino Wool Trench Coat</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>Active Catalog</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Section with Realtime Status Badge */}
                <div className="recent-orders-section" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        Recent Customer Orders ({recentOrders.length})
                      </h3>
                      <span style={{ background: '#f0fdf4', color: '#166534', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        ● Live Auto-Updating
                      </span>
                    </div>
                  </div>
                  <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                          <th style={{ padding: '12px 16px' }}>Order ID</th>
                          <th style={{ padding: '12px 16px' }}>Customer Name</th>
                          <th style={{ padding: '12px 16px' }}>Purchased Product</th>
                          <th style={{ padding: '12px 16px' }}>Order Amount</th>
                          <th style={{ padding: '12px 16px' }}>Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Live Order Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                              No recent orders recorded yet.
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order, index) => (
                            <tr key={order.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: '700', fontFamily: 'monospace', color: '#2563eb' }}>
                                {order.id}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>
                                {order.customer}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#334155', fontWeight: '500', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {order.product}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--jd-red)' }}>
                                {order.amount}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                                {formatDateTime(order.date)}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  style={{
                                    padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '700',
                                    border: '1px solid #cbd5e1', cursor: 'pointer', outline: 'none',
                                    backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Shipped' ? '#dbeafe' : '#fef3c7',
                                    color: order.status === 'Delivered' ? '#15803d' : order.status === 'Shipped' ? '#1d4ed8' : '#b45309'
                                  }}
                                >
                                  <option value="Processing">🟡 Processing</option>
                                  <option value="Shipped">🔵 Shipped</option>
                                  <option value="Delivered">🟢 Delivered</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
