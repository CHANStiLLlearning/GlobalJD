import React, { useState, useEffect } from 'react';

export default function CustomItemsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Marketing');

  const fetchCustomItems = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/custom-items')
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch custom items", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/custom-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, status: 'Active' })
      });
      if (res.ok) {
        setTitle('');
        fetchCustomItems();
      }
    } catch (err) {
      console.error("Failed to create custom item", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this custom item?")) {
      try {
        await fetch(`http://localhost:5000/api/custom-items/${id}`, { method: 'DELETE' });
        fetchCustomItems();
      } catch (err) {
        console.error("Failed to delete custom item", err);
      }
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>My Custom API Manager</h2>
          <p>Create and manage data using your newly built custom API (<code>/api/custom-items</code>).</p>
        </div>
      </div>

      {/* Form to post to custom API */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '32px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Add Item via POST API</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Enter custom item title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px' }}
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', backgroundColor: '#fff' }}
          >
            <option value="Marketing">Marketing</option>
            <option value="Promotions">Promotions</option>
            <option value="System">System</option>
          </select>
          <button 
            type="submit" 
            style={{ background: 'var(--jd-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Create via API
          </button>
        </form>
      </div>

      {/* Table listing data from GET custom API */}
      <div className="recent-orders-section">
        <div className="section-header">
          <h3>Custom Items (Fetched via GET <code>/api/custom-items</code>)</h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading custom items from API...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No custom items found. Add one above!</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ color: '#6b7280' }}>#{item.id}</td>
                      <td className="font-medium" style={{ color: '#111827' }}>{item.title}</td>
                      <td>
                        <span style={{ padding: '4px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge status-completed" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>{item.status || 'Active'}</span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500' }}
                        >
                          Delete via API
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
    </div>
  );
}
