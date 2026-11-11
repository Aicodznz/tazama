import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import './index.css';

// Recover once automatically if a stale PWA precache requests an outdated hashed asset chunk
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    try {
      const reloadedKey = 'tazama_preload_reloaded';
      if (!sessionStorage.getItem(reloadedKey)) {
        sessionStorage.setItem(reloadedKey, '1');
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  });
}

// Register PWA Service Worker safely
try {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.warn('Tazama SW registration notice:', error);
    },
  });
} catch (err) {
  console.warn('Service worker unavailable:', err);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
