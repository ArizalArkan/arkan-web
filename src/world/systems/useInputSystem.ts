import { useEffect } from 'react';
import { createKeyboardInput } from '@/game/input/keyboard';
import { usePlayerStore } from '@/game/stores/usePlayerStore';
import { selectIsWorldBlocked, useUIStore } from '@/game/stores/useUIStore';

type Keyboard = ReturnType<typeof createKeyboardInput>;

/** Live keyboard handle for the movement system to read each frame. */
export const input: { keyboard: Keyboard | null } = { keyboard: null };

const isWorldInputEnabled = () =>
  !selectIsWorldBlocked(useUIStore.getState()) && !usePlayerStore.getState().isTransitioning;

/** Keyboard to actions. Off while a window or dialog covers the town. */
export function useInputSystem() {
  useEffect(() => {
    const keyboard = createKeyboardInput({
      isEnabled: isWorldInputEnabled,
      onMoveKey: () => usePlayerStore.getState().setInputDevice('keyboard'),
      onAction(action) {
        const ui = useUIStore.getState();
        usePlayerStore.getState().setInputDevice('keyboard');
        if (action === 'interact') usePlayerStore.getState().requestInteract();
        else if (action === 'fastTravel') ui.openWindow('fast-travel');
        else if (action === 'questLog') ui.openWindow('quest-log');
        else ui.openWindow('settings'); // Esc with nothing open = menu
      },
    });
    input.keyboard = keyboard;
    return () => {
      keyboard.dispose();
      input.keyboard = null;
    };
  }, []);
}
