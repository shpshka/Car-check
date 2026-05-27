import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AppSettingsProvider } from './i18n.jsx';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AppSettingsProvider>
          <App />
        </AppSettingsProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
