// Já está correto, apenas garantir que importa o App.css
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';  // Certifique-se que App.css está importado
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);