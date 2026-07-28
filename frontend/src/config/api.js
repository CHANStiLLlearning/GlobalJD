// Auto-detects correct API URL:
// 1. Use VITE_API_URL environment variable if set (Vercel production with Render backend)
// 2. Use localhost:5000 for local development
// 3. Use relative /api for Vercel serverless fallback
export const API_BASE = 
  import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000' 
        : 'https://globaljd.onrender.com');
