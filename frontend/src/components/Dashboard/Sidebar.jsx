import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Zap,
  Sparkles,
  Laptop,
  Shirt,
  Globe,
  Code
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar({ activeMenu, setActiveMenu, setCurrentUser }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <Link to="/" className="sidebar-logo">JD<span>GLOBAL</span></Link>
        <span className="sidebar-role">Admin</span>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`sidebar-link ${activeMenu === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveMenu('overview')}
        >
          <LayoutDashboard size={20} /> Overview
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'products' ? 'active' : ''}`}
          onClick={() => setActiveMenu('products')}
        >
          <Package size={20} /> Products
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'flash-deals' ? 'active' : ''}`}
          onClick={() => setActiveMenu('flash-deals')}
        >
          <Zap size={20} /> Flash Deals
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'new-arrivals' ? 'active' : ''}`}
          onClick={() => setActiveMenu('new-arrivals')}
        >
          <Sparkles size={20} /> New Arrivals
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'electronics' ? 'active' : ''}`}
          onClick={() => setActiveMenu('electronics')}
        >
          <Laptop size={20} /> Electronics
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'fashion' ? 'active' : ''}`}
          onClick={() => setActiveMenu('fashion')}
        >
          <Shirt size={20} /> Fashion
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'global-brands' ? 'active' : ''}`}
          onClick={() => setActiveMenu('global-brands')}
        >
          <Globe size={20} /> Global Brands
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveMenu('customers')}
        >
          <Users size={20} /> Customers
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'custom-items' ? 'active' : ''}`}
          onClick={() => setActiveMenu('custom-items')}
        >
          <Code size={20} /> My Custom API
        </button>
        <button 
          className={`sidebar-link ${activeMenu === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveMenu('settings')}
        >
          <Settings size={20} /> Settings
        </button>
      </nav>

      <div className="sidebar-footer">
        <Link 
          to="/login" 
          className="sidebar-link logout-btn"
          onClick={() => {
            if (setCurrentUser) setCurrentUser(null);
          }}
        >
          <LogOut size={20} /> Logout
        </Link>
      </div>
    </aside>
  );
}
