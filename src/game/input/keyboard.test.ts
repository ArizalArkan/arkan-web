import { afterEach, describe, expect, it, vi } from 'vitest';
import { createKeyboardInput, isTypingTarget, type InputAction } from './keyboard';

const press = (code: string, init: KeyboardEventInit = {}, target: EventTarget = window) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ...init }),
  );
const release = (code: string) => window.dispatchEvent(new KeyboardEvent('keyup', { code }));

describe('keyboard input', () => {
  let input: ReturnType<typeof createKeyboardInput>;
  let enabled = true;
  const actions: InputAction[] = [];

  const start = () => {
    enabled = true;
    actions.length = 0;
    input = createKeyboardInput({
      isEnabled: () => enabled,
      onAction: (action) => actions.push(action),
    });
  };

  afterEach(() => {
    input.dispose();
    document.body.innerHTML = '';
  });

  it('maps WASD and arrows to a direction, with opposite keys cancelling', () => {
    start();
    press('KeyW');
    press('ArrowRight');
    expect(input.direction()).toEqual({ x: 1, z: -1 });
    press('KeyS');
    expect(input.direction()).toEqual({ x: 1, z: 0 });
    release('ArrowRight');
    release('KeyW');
    expect(input.direction()).toEqual({ x: 0, z: 1 });
  });

  it('fires each action once per press, ignoring key repeat', () => {
    start();
    press('KeyE');
    press('KeyE', { repeat: true });
    press('Enter');
    press('Space');
    press('KeyM');
    press('KeyQ');
    press('Escape');
    expect(actions).toEqual([
      'interact',
      'interact',
      'interact',
      'fastTravel',
      'questLog',
      'cancel',
    ]);
  });

  it('ignores shortcuts while typing and leaves Enter to focused buttons', () => {
    start();
    const field = document.createElement('input');
    const button = document.createElement('button');
    document.body.append(field, button);
    press('KeyM', {}, field);
    press('KeyW', {}, field);
    press('Enter', {}, button);
    press('KeyE', {}, button);
    expect(actions).toEqual(['interact']);
    expect(input.direction()).toEqual({ x: 0, z: 0 });
    expect(isTypingTarget(field)).toBe(true);
    expect(isTypingTarget(button)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });

  it('ignores browser shortcuts with modifier keys', () => {
    start();
    press('KeyM', { metaKey: true });
    press('KeyW', { ctrlKey: true });
    expect(actions).toEqual([]);
    expect(input.direction()).toEqual({ x: 0, z: 0 });
  });

  it('drops held keys on blur, on tab hide, and while disabled', () => {
    start();
    press('KeyD');
    window.dispatchEvent(new Event('blur'));
    expect(input.direction()).toEqual({ x: 0, z: 0 });

    press('KeyD');
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(input.direction()).toEqual({ x: 0, z: 0 });
    vi.restoreAllMocks();

    press('KeyD');
    enabled = false;
    expect(input.direction()).toEqual({ x: 0, z: 0 });
    press('KeyE');
    enabled = true;
    // The key held before the window opened must not resume on its own.
    expect(input.direction()).toEqual({ x: 0, z: 0 });
    expect(actions).toEqual([]);
  });

  it('stops listening after dispose', () => {
    start();
    input.dispose();
    press('KeyE');
    expect(actions).toEqual([]);
  });
});
