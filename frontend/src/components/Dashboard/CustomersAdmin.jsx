import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/users`)
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch customers:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (username) => {
    if (window.confirm(`Are you sure you want to permanently delete the account for ${username}?`)) {
      try {
        await fetch(`${API_BASE}/api/users/${username}`, { method: 'DELETE' });
        fetchCustomers();
      } catch (err) {
        console.error("Failed to delete user", err);
      }
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Customers Directory</h2>
          <p>Manage registered user accounts and permissions.</p>
        </div>
      </div>

      <div className="recent-orders-section">
        <div className="section-header">
          <h3>Registered Accounts</h3>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading customers...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Username</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No registered users found.</td>
                  </tr>
                ) : (
                  customers.map((user, index) => (
                    <tr key={index}>
                      <td className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: '#e5e7eb', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', color: '#6b7280', fontWeight: 'bold' 
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="font-medium">{user.username}</td>
                      <td>
                        <span className="status-badge status-completed" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
                          Active
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(user.username)} 
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          Remove Account
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
