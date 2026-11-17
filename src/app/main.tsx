import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startGameEffects } from '@/game/effects';
import { startPersistence } from '@/game/stores/useGameStore';
import { App } from './App';
import '@/styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

startPersistence();
startGameEffects();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
