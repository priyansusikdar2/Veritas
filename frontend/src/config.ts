/**
 * Veritas API Configuration
 * 
 * In development, defaults to local FastAPI server (http://127.0.0.1:8000).
 * In production on Render or Vercel, reads VITE_API_BASE environment variable.
 */
export const API_BASE = import.meta.env.VITE_API_BASE
  ? import.meta.env.VITE_API_BASE.replace(/\/$/, '')
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');
