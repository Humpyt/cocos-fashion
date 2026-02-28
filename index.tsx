import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const FALLBACK_IMAGE_URL = '/images/fashion-fallback.svg';

const installGlobalImageFallback = () => {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) {
        return;
      }

      if (target.dataset.fallbackApplied === 'true') {
        return;
      }

      if (!target.src.includes('images.unsplash.com')) {
        return;
      }

      target.dataset.fallbackApplied = 'true';
      target.src = FALLBACK_IMAGE_URL;
    },
    true,
  );
};

const clearDevServiceWorkers = async () => {
  if (!import.meta.env.DEV || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.debug('Service worker cleanup skipped', error);
  }
};

installGlobalImageFallback();
void clearDevServiceWorkers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
