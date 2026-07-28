import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { Sparkles, Plus, CheckCircle, XCircle, Tag, Edit, Trash2 } from 'lucide-react';

export default function NewArrivalsAdmin() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const newItems = data.filter(p => {
          if (!p) return false;
          if (p.tag && (p.tag.type === 'new' || String(p.tag.text).toLowerCase().includes('new') || String(p.tag.label).toLowerCase().includes('new'))) return true;
          if (p.isNew || p.id > 1000) return true;
          return false;
        });

        // Fallback to latest products if tag array is small
        const finalItems = newItems.length > 0 ? newItems : data.slice(0, 6);
        setItems(finalItems);
        filterByTab(finalItems, activeTab);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch new arrivals:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filterByTab = (itemList, tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'all') {
      setFilteredItems(itemList);
    } else {
      setFilteredItems(itemList.filter(p => (p.category || '').toLowerCase().includes(tabKey)));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete/hide this new arrival product?")) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (err) {
        console.error("Failed to delete product:", err);
      }
    }
  };

  const handleToggleStock = async (id, currentStock) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}/toggle-stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentStock })
      });
      fetchItems();
    } catch (err) {
      console.error("Failed to toggle stock status", err);
    }
  };

  const handleSave = async (formData) => {
    try {
      const payload = {
        ...formData,
        tag: { text: "New Arrival", type: "new" }
      };

      if (editingProduct) {
        await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`http://localhost:5000/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to save new arrival product", err);
    }
  };

  // Live Stats calculations
  const totalCount = items.length;
  const inStockCount = items.filter(p => p.inStock !== false).length;
  const outOfStockCount = items.filter(p => p.inStock === false).length;
  const totalInventoryValue = items.reduce((sum, p) => sum + (Number(p.price) || 0) * (p.stockCount || 50), 0);

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            ✨ New Arrivals Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Review, publish, and control visibility for newly launched products on GlobalJD.
          </p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff',
            padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(5,150,105,0.3)'
          }}
        >
          <Plus size={18} /> Add New Arrival
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Total New Arrivals</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{totalCount} Releases</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Published & In Stock</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a' }}>{inStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Out of Stock Alert</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: outOfStockCount > 0 ? '#dc2626' : '#64748b' }}>{outOfStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Est. New Release Value</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#059669' }}>${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Sub-category Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All New Releases' },
          { key: 'electronics', label: 'Tech Hardware' },
          { key: 'fashion', label: 'Fashion & Apparel' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => filterByTab(items, tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: activeTab === tab.key ? '2px solid #059669' : '1px solid #e2e8f0',
              background: activeTab === tab.key ? '#d1fae5' : '#ffffff', color: activeTab === tab.key ? '#065f46' : '#475569',
              fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '500', cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New Arrivals Inventory Data Table */}
      <div className="recent-orders-section" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Recently Launched Products ({filteredItems.length})
          </h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading new arrivals list...</div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Product Name</th>
                  <th style={{ padding: '12px 16px' }}>Brand</th>
                  <th style={{ padding: '12px 16px' }}>SKU</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Stock Status</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Rating</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                      No new arrivals found in this subcategory.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={item.image} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name}
                            </div>
                            <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              NEW RELEASE
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#047857' }}>
                        {item.brand || 'Brand Select'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                        {item.sku || `NEW-${item.id}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button 
                          onClick={() => handleToggleStock(item.id, item.inStock !== false)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                          title="Click to toggle stock status"
                        >
                          {item.inStock !== false ? (
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
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--jd-red)' }}>
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#d97706', fontWeight: '700', fontSize: '13px' }}>
                        ★ {item.ratingValue || (item.rating ? item.rating.split(' ')[0] : '4.9')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} 
                          style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '12px', fontWeight: '600', fontSize: '13px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
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
        initialTag={{ type: 'new', label: 'New Arrival' }}
      />
    </div>
  );
}
