import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process for browser environment to prevent runtime crashes
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);