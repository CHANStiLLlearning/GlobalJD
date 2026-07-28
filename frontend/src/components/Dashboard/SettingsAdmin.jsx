import React, { useState, useEffect } from 'react';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    storeName: '',
    email: '',
    currency: 'USD',
    notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch settings:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    
    fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setSaving(false);
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      })
      .catch(err => {
        console.error("Failed to save settings:", err);
        setSaving(false);
        setSaveMessage('Error saving settings.');
      });
  };

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Store Configuration</h2>
          <p>Manage your global store settings and preferences.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>
      ) : (
        <div style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSave} style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            <h3 style={{ marginTop: 0, marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>General Settings</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Store Name</label>
                <input 
                  type="text" 
                  name="storeName" 
                  value={settings.storeName} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Support Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={settings.email} 
                  onChange={handleChange} 
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            <h3 style={{ marginTop: '32px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>Preferences</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Currency</label>
                <select 
                  name="currency" 
                  value={settings.currency} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '28px' }}>
                  <input 
                    type="checkbox" 
                    name="notifications"
                    checked={settings.notifications}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', marginRight: '10px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Enable Email Notifications</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              {saveMessage && (
                <span style={{ color: saveMessage.includes('Error') ? '#ef4444' : '#10b981', fontSize: '14px', fontWeight: '500' }}>
                  {saveMessage}
                </span>
              )}
              <button 
                type="submit" 
                disabled={saving}
                style={{ 
                  background: '#000', color: '#fff', padding: '10px 24px', border: 'none', 
                  borderRadius: '4px', fontSize: '14px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer' 
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
