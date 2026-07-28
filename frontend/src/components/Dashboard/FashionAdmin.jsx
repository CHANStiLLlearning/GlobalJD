import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { ShoppingBag, Tag, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function FashionAdmin() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/products`)
      .then(res => res.json())
      .then(data => {
        const fashionItems = data.filter(p => {
          const cat = (p.category || '').toLowerCase();
          return cat.includes('fashion') || cat.includes('clothing') || cat.includes('apparel') || 
                 cat.includes('jewelery') || cat.includes('bags') || cat.includes('eyewear') || cat.includes('footwear');
        });
        setItems(fashionItems);
        filterByTab(fashionItems, activeTab);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch fashion items:", err);
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
    if (window.confirm("Are you sure you want to delete this fashion item?")) {
      try {
        await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (err) {
        console.error("Failed to delete product:", err);
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
      fetchItems();
    } catch (err) {
      console.error("Failed to toggle stock status", err);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await fetch(`${API_BASE}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_BASE}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            category: formData.category || "Fashion > Apparel"
          })
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to save fashion product", err);
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
            👗 Fashion & Apparel Management
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage clothing lines, footwear, designer bags, sunglasses, and luxury apparel specs.
          </p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          style={{
            background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)', color: '#ffffff',
            padding: '10px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(217,70,239,0.3)'
          }}
        >
          <Plus size={18} /> Add Fashion Item
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Total Fashion Listings</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{totalCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Available In Stock</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#16a34a' }}>{inStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Out of Stock Alert</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: outOfStockCount > 0 ? '#dc2626' : '#64748b' }}>{outOfStockCount} Items</div>
        </div>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>Est. Catalog Value</div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#9333ea' }}>${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Sub-category Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Items' },
          { key: 'men', label: "Men's Apparel" },
          { key: 'women', label: "Women's Apparel" },
          { key: 'bags', label: 'Bags & Leather' },
          { key: 'eyewear', label: 'Eyewear' },
          { key: 'footwear', label: 'Footwear' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => filterByTab(items, tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: activeTab === tab.key ? '2px solid #a855f7' : '1px solid #e2e8f0',
              background: activeTab === tab.key ? '#f3e8ff' : '#ffffff', color: activeTab === tab.key ? '#7e22ce' : '#475569',
              fontSize: '13px', fontWeight: activeTab === tab.key ? '700' : '500', cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apparel Products Data Table */}
      <div className="recent-orders-section" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Apparel Inventory List ({filteredItems.length})
          </h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading fashion items...</div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Item Name</th>
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
                      No fashion items found in this subcategory.
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
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              Sizes: {Array.isArray(item.sizes) ? item.sizes.join(', ') : 'Standard'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#4338ca' }}>
                        {item.brand || 'Fashion Select'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                        {item.sku || `FSH-${item.id}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#fdf4ff', color: '#a21caf', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          {item.category || 'Fashion'}
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
                        ★ {item.ratingValue || (item.rating ? item.rating.split(' ')[0] : '4.8')}
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
      />
    </div>
  );
}
