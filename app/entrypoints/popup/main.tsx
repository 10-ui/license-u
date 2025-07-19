import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/entrypoints/popup/App.tsx';
import '@/assets/tailwind.css';
import './style.css';

// Create root container
const rootContainer = document.createElement('div');
rootContainer.id = 'root';
document.body.appendChild(rootContainer);

ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
