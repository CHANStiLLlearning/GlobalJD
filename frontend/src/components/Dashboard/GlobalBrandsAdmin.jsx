import React, { useState, useEffect } from 'react';
import ProductModal from './ProductModal';

export default function GlobalBrandsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const globalBrandsItems = data.filter(p => p.tag && p.tag.type === 'bestseller');
        setItems(globalBrandsItems);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch global brands:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove the best seller badge from this product?")) {
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

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Global Brands Hub</h2>
          <p>Oversee top-performing global products and best sellers.</p>
        </div>
        <button className="icon-btn" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
          + Add Top Brand
        </button>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h3>Best Sellers Directory</h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading global brands...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Global ID</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No global brands found.</td>
                  </tr>
                ) : (
                  items.slice(0, 7).map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                        <span style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      </td>
                      <td style={{ color: '#6b7280' }}>#GLB-{item.id}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                      <td className="font-medium">${item.price.toFixed(2)}</td>
                      <td>
                        {item.inStock !== false ? (
                          <span className="status-badge status-completed" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>In Stock</span>
                        ) : (
                          <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <button onClick={() => { setEditingProduct(item); setIsModalOpen(true); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                        <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Remove Badge</button>
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
        initialTag={{ type: 'bestseller', label: 'Best Seller' }}
      />
    </div>
  );
}
