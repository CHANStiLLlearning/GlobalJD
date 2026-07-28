import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="dashboard-header">
      <div className="search-wrapper">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search orders, customers, or products..." />
      </div>
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="admin-profile">
          <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
          <span>Admin User</span>
        </div>
      </div>
    </header>
  );
}
