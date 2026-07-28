import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingProduct) {
        await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`http://localhost:5000/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchItems();
    } catch (err) {
      console.error("Failed to save product", err);
    }
  };

  const handleToggleStock = async (id, currentStock) => {
    try {
      await fetch(`http://localhost:5000/api/products/${id}/toggle-stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentStock })
      });
      setItems(prev => prev.map(p => p.id === id ? { ...p, inStock: !currentStock } : p));
    } catch (err) {
      console.error("Failed to toggle stock status", err);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Products Inventory</h2>
          <p>Manage all product listings, prices, categories, and stock availability.</p>
        </div>
        <button className="icon-btn" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} style={{ background: 'var(--jd-red)', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
          + Add New Product
        </button>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h3>All Products</h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading inventory...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No products found.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                        <span style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      </td>
                      <td style={{ color: '#6b7280', textTransform: 'capitalize' }}>{item.category || 'Uncategorized'}</td>
                      <td className="font-medium">${item.price.toFixed(2)}</td>
                      <td>
                        <button 
                          onClick={() => handleToggleStock(item.id, item.inStock !== false)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                          title="Click to toggle stock status"
                        >
                          {item.inStock !== false ? (
                            <span className="status-badge status-completed" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>In Stock ✓</span>
                          ) : (
                            <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Out of Stock ✕</span>
                          )}
                        </button>
                      </td>
                      <td>
                        <button onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        product={editingProduct} 
      />
    </div>
  );
}
