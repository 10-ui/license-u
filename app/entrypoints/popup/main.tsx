import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/entrypoints/popup/App.tsx';
import '@/assets/tailwind.css';

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
