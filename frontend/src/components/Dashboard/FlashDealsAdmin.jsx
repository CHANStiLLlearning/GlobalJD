import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { Flame, Plus, CheckCircle, XCircle, Tag, Edit, Trash2, Percent } from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function FlashDealsAdmin() {
  const [deals, setDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchDeals = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        const productList = Array.isArray(data) ? data : [];
        setAllProducts(productList);

        const activeDeals = productList.filter(p => {
          if (!p) return false;
          if (p.discount || (p.originalPrice && p.originalPrice > p.price)) return true;
          if (p.tag && (p.tag.type === 'discount' || String(p.tag.text).toLowerCase().includes('deal') || String(p.tag.label).toLowerCase().includes('deal'))) return true;
          return false;
        });

        setDeals(activeDeals);
        filterByTab(activeDeals, activeTab);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch flash deals:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filterByTab = (itemList, tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'all') {
      setFilteredDeals(itemList);
    } else {
      setFilteredDeals(itemList.filter(p => (p.category || '').toLowerCase().includes(tabKey)));
    }
  };

  const handleToggleFlashDeal = async (productId, currentIsDeal) => {
    try {
      await fetch(`${API_BASE}/api/products/${productId}/flash-deal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlashDeal: !currentIsDeal, discountPercent: 25 })
      });
      fetchDeals();
    } catch (err) {
      console.error("Failed to toggle flash deal status", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to end this flash deal?")) {
      try {
        await handleToggleFlashDeal(id, true);
      } catch (err) {
        console.error("Failed to end deal:", err);
      }
    }
  };

  const handleToggleStock = async (id, currentStock) => {
    try {
      await fetch(`${API_BASE}/api/products/${id}/toggle-stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentStock })
      });
      fetchDeals();
    } catch (err) {
      console.error("Failed to toggle stock status", err);
    }
  };

  const handleSave = async (formData) => {
    try {
      const payload = {
        ...formData,
        discount: formData.discount || "25% Off",
        originalPrice: formData.originalPrice || (formData.price ? Number(formData.price) * 1.25 : null),
        tag: { text: "Flash Deal", type: "discount", label: "-25%" }
      };

      if (editingProduct) {
        await fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`${API_BASE}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchDeals();
    } catch (err) {
      console.error("Failed to save flash deal", err);
    }
  };

  // Live Stats calculations
  const totalCount = deals.length;
  const inStockCount = deals.filter(p => p.inStock !== false).length;
  const outOfStockCount = deals.filter(p => p.inStock === false).length;
  const totalDealRevenue = deals.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.stockCount || 50), 0);

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            🔥 Flash Deals Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Both sides linked! Edit promotions here to update the customer storefront in real-time.
          </p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)', color: '#ffffff',
            padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(220,38,38,0.3)'
          }}
        >
          <Plus size={18} /> Add New Deal
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Active Flash Deals</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{totalCount} Deals</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Promotions In Stock</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a' }}>{inStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Out of Stock Alert</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: outOfStockCount > 0 ? '#dc2626' : '#64748b' }}>{outOfStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Est. Deal Inventory Value</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#dc2626' }}>${totalDealRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Sub-category Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Flash Deals' },
          { key: 'electronics', label: 'Tech Deals' },
          { key: 'fashion', label: 'Fashion Deals' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => filterByTab(deals, tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: activeTab === tab.key ? '2px solid #dc2626' : '1px solid #e2e8f0',
              background: activeTab === tab.key ? '#fee2e2' : '#ffffff', color: activeTab === tab.key ? '#991b1b' : '#475569',
              fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '500', cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flash Deals Inventory Data Table */}
      <div className="recent-orders-section" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Active Promotional Listings ({filteredDeals.length})
          </h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading active flash deals...</div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Product Name</th>
                  <th style={{ padding: '12px 16px' }}>Brand</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Original Price</th>
                  <th style={{ padding: '12px 16px' }}>Discount Badge</th>
                  <th style={{ padding: '12px 16px' }}>Deal Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No active flash deals found in this subcategory.
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal) => {
                    const discountBadge = deal.discount || (deal.tag?.label || deal.tag?.text || '25% Off');
                    const origPrice = deal.originalPrice || (deal.price ? deal.price * 1.25 : 0);

                    return (
                      <tr key={deal.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={deal.image} alt={deal.name} style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            <div>
                              <div style={{ fontWeight: '700', color: '#1e293b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {deal.name}
                              </div>
                              <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                🔥 FLASH DEAL
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#dc2626' }}>
                          {deal.brand || 'Brand Select'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                            {deal.category || 'Electronics'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textDecoration: 'line-through', color: '#94a3b8', fontWeight: '500' }}>
                          ${Number(origPrice).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#dc2626', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                            {discountBadge}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--jd-red)' }}>
                          ${Number(deal.price).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button 
                            onClick={() => handleToggleStock(deal.id, deal.inStock !== false)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                            title="Click to toggle stock status"
                          >
                            {deal.inStock !== false ? (
                              <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                                In Stock ✓
                              </span>
                            ) : (
                              <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                                Out of Stock ✕
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={() => { setEditingProduct(deal); setIsModalOpen(true); }} 
                            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '12px', fontWeight: '600', fontSize: '13px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(deal.id)} 
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                          >
                            End Deal
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal with Full 21 Specification Fields support */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        product={editingProduct} 
        initialTag={{ type: 'discount', label: '-25%', text: 'Flash Deal' }}
      />
    </div>
  );
}
