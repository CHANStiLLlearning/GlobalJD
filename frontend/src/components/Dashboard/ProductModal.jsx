import React, { useState, useEffect } from 'react';

export default function ProductModal({ isOpen, onClose, onSave, product, initialTag = null }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    sku: '',
    price: '',
    originalPrice: '',
    category: '',
    weight: '',
    warranty: '',
    description: '',
    image: '',
    tag: initialTag,
    inStock: true
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        sku: product.sku || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        category: product.category || '',
        weight: product.weight || '',
        warranty: product.warranty || '',
        description: product.description || '',
        image: product.image || '',
        tag: product.tag || initialTag,
        inStock: product.inStock !== false
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        sku: '',
        price: '',
        originalPrice: '',
        category: '',
        weight: '',
        warranty: '',
        description: '',
        image: '',
        tag: initialTag,
        inStock: true
      });
    }
  }, [product, isOpen, initialTag]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '28px', 
        width: '540px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>
          {product ? 'Edit Product Specifications' : 'Add New Product'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Product Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Brand Name</label>
              <input 
                type="text" 
                name="brand" 
                value={formData.brand} 
                onChange={handleChange} 
                placeholder="e.g. Sony, Apple"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>SKU Code</label>
              <input 
                type="text" 
                name="sku" 
                value={formData.sku} 
                onChange={handleChange} 
                placeholder="e.g. SON-WH1000XM5-BLK"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="Fashion > Bags">Fashion & Bags</option>
                <option value="Fashion > Eyewear">Fashion & Eyewear</option>
                <option value="electronics > Audio">Electronics & Audio</option>
                <option value="electronics > Wearables">Electronics & Wearables</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Selling Price ($) *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange}
                step="0.01"
                required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Original Price ($)</label>
              <input 
                type="number" 
                name="originalPrice" 
                value={formData.originalPrice} 
                onChange={handleChange}
                step="0.01"
                placeholder="e.g. 349.99"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Product Weight</label>
              <input 
                type="text" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                placeholder="e.g. 250 g"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Warranty Info</label>
              <input 
                type="text" 
                name="warranty" 
                value={formData.warranty} 
                onChange={handleChange}
                placeholder="e.g. 1-Year Manufacturer Warranty"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Main Image URL</label>
            <input 
              type="url" 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>Product Overview Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="Detailed overview of the product specifications and advantages..."
              style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} 
            />
          </div>

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              name="inStock"
              id="inStockCheck"
              checked={formData.inStock} 
              onChange={handleChange} 
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="inStockCheck" style={{ fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
              Product Available In Stock
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{ padding: '10px 24px', background: 'var(--jd-red)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
            >
              Save Product Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
