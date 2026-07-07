/**
 * Setup global Vitest + Testing Library — T-306
 */
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Supprimer les warnings React pour les tests
global.console.error = (msg, ...args) => {
  if (typeof msg === 'string' && (
    msg.includes('Warning:') ||
    msg.includes('ReactDOM.render') ||
    msg.includes('act(')
  )) return;
  console.error(msg, ...args);
};

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_API_URL: 'http://localhost:5000/api',
      MODE: 'test',
      DEV: true,
    },
  },
});
