// Auto-detects and normalizes the correct API URL for all environments:
// 1. Normalizes VITE_API_URL if set (fixes globaljd-backend -> globaljd URL typos)
// 2. Uses http://localhost:5000 for local development
// 3. Fallbacks to production https://globaljd.onrender.com

let rawUrl = import.meta.env.VITE_API_URL;

if (rawUrl && typeof rawUrl === 'string') {
  // Auto-correct any leftover typo in Vercel environment variable
  rawUrl = rawUrl.replace('globaljd-backend.onrender.com', 'globaljd.onrender.com').replace(/\/+$/, '');
}

export const API_BASE = (rawUrl && rawUrl.length > 0)
  ? rawUrl
  : (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://globaljd.onrender.com');
