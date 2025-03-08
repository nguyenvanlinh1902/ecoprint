import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './styles/index.scss';
import { ThemeProvider } from './contexts/ThemeContext';

// Tạo file SCSS cơ bản nếu chưa tồn tại
if (!document.getElementById('app-styles')) {
  const style = document.createElement('style');
  style.id = 'app-styles';
  style.innerHTML = `
    body {
      margin: 0;
      padding: 0;
      font-family: 'Roboto', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      min-height: 100vh;
    }
  `;
  document.head.appendChild(style);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
