/**
 * File: main.jsx
 * Muc dich: Diem khoi tao ReactDOM cho ung dung React.
 * Chuc nang: Render thanh phan App vao phan tu DOM #root va nhung file index.css.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './thanhphan/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
