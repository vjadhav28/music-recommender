import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Inject Google AdSense loader once if a publisher id is configured.
const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;
if (ADSENSE_CLIENT_ID && typeof document !== 'undefined') {
  const existing = document.querySelector('script[data-adsense-loader]');
  if (!existing) {
    const s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    s.setAttribute('data-adsense-loader', 'true');
    document.head.appendChild(s);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
