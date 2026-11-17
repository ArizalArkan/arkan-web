import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startGameEffects } from '@/game/effects';
import { startPersistence } from '@/game/stores/useGameStore';
import { useSettingsStore } from '@/game/stores/useSettingsStore';
import { audio } from '@/services/audio';
import { App } from './App';
import { initialMode } from './boot';
import '@/styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

// Mode order: ?mode= > saved choice > no WebGL / reduced motion / save-data > adventure.
// Resolved here, not remembered: only an explicit choice is saved.
const settings = useSettingsStore.getState();
settings.setMode(initialMode(settings.savedMode).mode, { remember: false });
audio.setEnabled(settings.sound);

if (new URLSearchParams(window.location.search).has('qa')) {
  document.documentElement.dataset.qa = 'true';
}

startPersistence();
startGameEffects();

// The static shell in index.html is only for no-JS visitors and crawlers.
document.getElementById('static-shell')?.remove();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
