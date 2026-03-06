import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PasswordGate from './PasswordGate.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

window.addEventListener('error', (e) => {
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:40px;font-family:monospace">UNCAUGHT: ' + e.message + '\n' + (e.error?.stack || '') + '</pre>';
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[BTM] unhandled rejection:', e.reason);
});
console.log('[BTM] main.jsx loaded, mounting app...');
try {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <PasswordGate>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </PasswordGate>
    </StrictMode>,
  );
  console.log('[BTM] render called successfully');
} catch(e) {
  console.error('[BTM] mount error:', e);
  document.getElementById('root').innerHTML = '<pre style="color:red;padding:40px">' + e.message + '\n' + e.stack + '</pre>';
}
