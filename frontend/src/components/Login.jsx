import React, { useState } from 'react';
import { QrCode, MessageSquare, ChevronDown, MonitorSmartphone, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { API_BASE } from '../config/api';

export default function Login({ setCurrentUser }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [loginMethod, setLoginMethod] = useState('password');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!username || !password) {
      setErrorMsg('Please enter both email/username and password.');
      return;
    }

    if (isRegistering) {
      if (password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    }

    const endpoint = isRegistering ? `${API_BASE}/api/register` : `${API_BASE}/api/login`;
    const payload = isRegistering 
      ? { username: username.trim(), password, fullName: fullName.trim() } 
      : { username: username.trim(), password };
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMsg(data.error || 'Authentication failed');
      } else {
        if (isRegistering) {
          setSuccessMsg('Account registered successfully in real database! Logging you in...');
          setTimeout(() => {
            if (setCurrentUser) setCurrentUser(data.user);
            navigate('/');
          }, 1200);
        } else {
          if (setCurrentUser) setCurrentUser(data.user);
          navigate('/');
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg('Failed to connect to server. Please try again.');
    }
  };

  return (
    <div className="login-page">
      {/* 1. Header Section */}
      <header className="login-header">
        <div className="login-header-inner">
          <div className="login-header-left">
            <Link to="/" className="back-arrow" title="Back to Homepage">
              <ArrowLeft size={24} />
            </Link>
            <Link to="/" className="login-logo-link">
              <div className="login-logo">
                JD.com
                <span className="login-welcome">{isRegistering ? 'Register' : 'Welcome'}</span>
              </div>
            </Link>
          </div>
          
          <a href="#" className="login-feedback">
            <MessageSquare size={16} />
            <span>Feedback</span>
          </a>
        </div>
      </header>

      {/* 2. Main Login Container & Top Tabs */}
      <main className="login-main">
        
        <div className="login-top-tabs">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`login-top-tab ${activeTab === 'personal' ? 'active' : ''}`}
          >
            Personal Account
            {activeTab === 'personal' && <span className="tab-indicator"></span>}
          </button>
          
          <button 
            onClick={() => setActiveTab('enterprise')}
            className={`login-top-tab ${activeTab === 'enterprise' ? 'active' : ''}`}
          >
            Enterprise Account
            {activeTab === 'enterprise' && <span className="tab-indicator"></span>}
          </button>
        </div>

        {/* 3. Central Dual-Column Card */}
        <div className="login-card">
          
          {/* Left Column - QR Login (Hidden in register mode to focus on form) */}
          <div className="login-left-col" style={{ opacity: isRegistering ? 0.5 : 1 }}>
            <h3 className="qr-title">Scan to Login Securely</h3>
            
            <div className="qr-container">
               <QrCode size={180} strokeWidth={1} className="qr-icon" />
               <div className="qr-center-logo-wrapper">
                  <div className="qr-center-logo">
                    <span>JD</span>
                  </div>
               </div>
            </div>

            <div className="qr-footer">
               <div className="qr-footer-item">
                 <MonitorSmartphone size={14} className="icon-jd" />
                 <span>JD App</span>
               </div>
               <span className="qr-divider">|</span>
               <div className="qr-footer-item">
                 <MessageSquare size={14} className="icon-wechat" />
                 <span>WeChat</span>
               </div>
               <span className="qr-divider">|</span>
               <a href="#" className="qr-help-link">Tutorial</a>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="login-right-col">
            
            <div className="form-tabs">
              <button 
                className="form-tab active"
                style={{ width: '100%' }}
              >
                {isRegistering ? 'Create New Account' : 'Password Login'}
              </button>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <input 
                    type="text" 
                    placeholder="Full Name (Optional)" 
                    className="login-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Email / Phone / Username" 
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="input-group" style={{ marginBottom: '12px' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="login-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {!isRegistering && (
                  <button type="button" className="password-toggle">
                    <ChevronDown size={18} />
                  </button>
                )}
              </div>

              {isRegistering && (
                <div className="input-group" style={{ marginBottom: '12px' }}>
                  <input 
                    type="password" 
                    placeholder="Confirm Password" 
                    className="login-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {errorMsg && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{errorMsg}</div>}
              {successMsg && <div style={{ color: '#10b981', fontSize: '13px', marginBottom: '12px' }}>{successMsg}</div>}

              <button type="submit" className="login-submit-btn">
                {isRegistering ? 'Register Now' : 'Log In'}
              </button>
            </form>

            <div className="form-footer">
              <div className="form-footer-left">
                {!isRegistering && (
                  <>
                    <a href="#" className="social-link">
                       <MessageSquare size={14} className="icon-wechat" />
                       WeChat
                    </a>
                    <a href="#" className="social-link">
                       <MonitorSmartphone size={14} className="icon-qq" />
                       QQ
                    </a>
                  </>
                )}
              </div>
              <div className="form-footer-right">
                {isRegistering ? (
                  <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setIsRegistering(false); setErrorMsg(''); setSuccessMsg(''); }}>&larr; Back to Login</a>
                ) : (
                  <>
                    <a href="#" className="footer-link">Forgot Password</a>
                    <a href="#" className="footer-link" onClick={(e) => { e.preventDefault(); setIsRegistering(true); setErrorMsg(''); setSuccessMsg(''); }}>Register Now</a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Page Footer */}
      <footer className="login-page-footer">
        <div className="footer-links">
          <a href="#">About Us</a> <span className="footer-divider">|</span>
          <a href="#">Contact Us</a> <span className="footer-divider">|</span>
          <a href="#">Careers</a> <span className="footer-divider">|</span>
          <a href="#">Become a Seller</a> <span className="footer-divider">|</span>
          <a href="#">Advertising</a> <span className="footer-divider">|</span>
          <a href="#">Mobile App</a> <span className="footer-divider">|</span>
          <a href="#">Links</a> <span className="footer-divider">|</span>
          <a href="#">Affiliates</a> <span className="footer-divider">|</span>
          <a href="#">Community</a> <span className="footer-divider">|</span>
          <a href="#">Charity</a>
        </div>
        <div className="footer-copyright">
          Copyright © 2004-2026 JD.com All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
