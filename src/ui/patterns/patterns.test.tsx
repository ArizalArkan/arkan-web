import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReducedMotionProvider } from '@/lib/motion';
import { ConfirmDialog } from './ConfirmDialog';
import { DialogBox } from './DialogBox';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { FormField } from './FormField';
import { MenuList, type MenuItem } from './MenuList';
import { Modal } from './Modal';
import { SceneTransition } from './SceneTransition';
import { tabIds } from './tabIds';
import { Tabs } from './Tabs';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';
import { ToastViewport } from './ToastViewport';
import { Tooltip } from './Tooltip';
import { Window } from './Window';

afterEach(() => vi.useRealTimers());

describe('DialogBox', () => {
  const speaker = { name: 'Wren' };

  it('first input completes the text, second goes to the next page', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    render(
      <DialogBox speaker={speaker} lines={['Hello there.', 'Page two.']} onFinish={onFinish} />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Wren' });
    // The full page is in the DOM for screen readers from the start.
    expect(screen.getByText('Hello there.', { selector: '.sr-only' })).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(dialog).toHaveTextContent('Next');
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(screen.getByText('Page two.', { selector: '.sr-only' })).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Enter' });
    fireEvent.keyDown(dialog, { key: 'Enter' });
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('types over time, pausing after punctuation', () => {
    vi.useFakeTimers();
    render(<DialogBox speaker={speaker} lines={['Hi.']} typeSpeed={30} />);
    const visible = () => document.querySelector('[aria-hidden="true"].font-body')?.textContent;
    expect(visible()).toBe('');
    act(() => vi.advanceTimersByTime(30));
    expect(visible()).toBe('H');
    act(() => vi.advanceTimersByTime(30));
    expect(visible()).toBe('Hi');
    act(() => vi.advanceTimersByTime(30));
    expect(visible()).toContain('Hi.');
  });

  it('is instant under reduced motion and ignores key repeat', () => {
    const onFinish = vi.fn();
    render(
      <ReducedMotionProvider value={true}>
        <DialogBox speaker={speaker} lines={['Done.']} onFinish={onFinish} />
      </ReducedMotionProvider>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Enter', repeat: true });
    expect(onFinish).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onFinish).toHaveBeenCalledOnce();
  });

  it('offers choices with arrow navigation; Esc picks the last (exit)', () => {
    const onChoose = vi.fn();
    render(
      <DialogBox
        speaker={speaker}
        lines={['Where to?']}
        typeSpeed={0}
        choices={[
          { id: 'travel', label: 'Fast Travel' },
          { id: 'bye', label: 'Goodbye' },
        ]}
        onChoose={onChoose}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(screen.getByRole('option', { name: /Fast Travel/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(dialog, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: /Goodbye/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(dialog, { key: 'e' });
    expect(onChoose).toHaveBeenLastCalledWith('bye');
    fireEvent.click(screen.getByRole('option', { name: /Fast Travel/ }));
    expect(onChoose).toHaveBeenLastCalledWith('travel');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onChoose).toHaveBeenLastCalledWith('bye');
  });

  it('Esc closes a dialog without choices', () => {
    const onClose = vi.fn();
    render(<DialogBox speaker={speaker} lines={['Bye.']} typeSpeed={0} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('MenuList', () => {
  const items: MenuItem[] = [
    { id: 'guild', label: 'Guild Hall', icon: 'hall', hint: 'About' },
    { id: 'quest', label: 'Quest Board' },
    { id: 'locked', label: 'Locked Door', disabled: true },
    { id: 'post', label: 'Post Office' },
  ];

  function Harness({ onConfirm = vi.fn() }: { onConfirm?: (id: string) => void }) {
    const [value, setValue] = useState<string | null>(null);
    return (
      <MenuList
        label="Locations"
        items={items}
        value={value}
        onChange={setValue}
        onConfirm={onConfirm}
      />
    );
  }

  const selected = () => screen.getByRole('option', { selected: true });

  it('moves with arrows, skips disabled, wraps, and jumps with Home/End', () => {
    render(<Harness />);
    const list = screen.getByRole('listbox', { name: 'Locations' });
    expect(selected()).toHaveTextContent('Guild Hall');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(selected()).toHaveTextContent('Post Office');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(selected()).toHaveTextContent('Guild Hall');
    fireEvent.keyDown(list, { key: 'End' });
    expect(selected()).toHaveTextContent('Post Office');
    fireEvent.keyDown(list, { key: 'Home' });
    expect(selected()).toHaveTextContent('Guild Hall');
    fireEvent.keyDown(list, { key: 'ArrowUp' });
    expect(selected()).toHaveTextContent('Post Office');
  });

  it('jumps by first letter and confirms with Enter or click', () => {
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'q' });
    expect(selected()).toHaveTextContent('Quest Board');
    fireEvent.keyDown(selected(), { key: 'Enter' });
    expect(onConfirm).toHaveBeenLastCalledWith('quest');
    fireEvent.click(screen.getByRole('option', { name: /Post Office/ }));
    expect(onConfirm).toHaveBeenLastCalledWith('post');
    fireEvent.click(screen.getByRole('option', { name: /Locked Door/ }));
    expect(onConfirm).not.toHaveBeenCalledWith('locked');
  });

  it('uses roving tabindex', () => {
    render(<Harness />);
    const tabbable = screen.getAllByRole('option').filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
  });

  it('supports grid navigation', () => {
    const onChange = vi.fn();
    render(
      <MenuList
        label="Grid"
        orientation="grid"
        columns={2}
        items={items}
        value="guild"
        onChange={onChange}
        onConfirm={vi.fn()}
      />,
    );
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith('quest');
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith('post');
  });
});

describe('Modal and ConfirmDialog', () => {
  it('focuses Cancel first for destructive actions and keeps Cancel on the left', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        tone="danger"
        title="Delete all progress?"
        message="This cannot be undone."
        confirmLabel="Delete Progress"
      />,
    );
    const [cancel, confirm] = screen.getAllByRole('button').filter((b) => b.textContent !== '');
    expect(cancel).toHaveTextContent('Cancel');
    expect(confirm).toHaveTextContent('Delete Progress');
    expect(document.activeElement).toBe(cancel);
    fireEvent.click(confirm!);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Esc (cancel event) and backdrop click when dismissible', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Settings">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByTestId('modal');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    fireEvent.click(dialog);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('renders nothing inside while closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden">
        <p>Secret body</p>
      </Modal>,
    );
    expect(screen.queryByText('Secret body')).not.toBeInTheDocument();
  });
});

describe('Window', () => {
  it('focuses its title, closes on Esc, goes back on Backspace', () => {
    const onClose = vi.fn();
    const onBack = vi.fn();
    render(
      <Window
        id="quest-board"
        title="Quest Board"
        subtitle="Projects"
        icon="scroll"
        onClose={onClose}
        onBack={onBack}
        footer={<span>hints</span>}
      >
        <input aria-label="search" />
      </Window>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Quest Board' });
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Quest Board' }));
    fireEvent.keyDown(screen.getByLabelText('search'), { key: 'Backspace' });
    expect(onBack).not.toHaveBeenCalled();
    fireEvent.keyDown(dialog, { key: 'Backspace' });
    expect(onBack).toHaveBeenCalledOnce();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('traps Tab inside', () => {
    render(
      <Window id="armory" title="Armory" icon="sword" onClose={vi.fn()}>
        <button type="button">Inside</button>
      </Window>,
    );
    const close = screen.getByRole('button', { name: 'Close' });
    const inside = screen.getByRole('button', { name: 'Inside' });
    inside.focus();
    fireEvent.keyDown(inside, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(inside);
  });

  it('closes on a long downward swipe from the header', () => {
    const onClose = vi.fn();
    render(
      <Window id="library" title="Library" icon="book" onClose={onClose}>
        body
      </Window>,
    );
    const header = screen.getByRole('heading', { name: 'Library' }).closest('div')!.parentElement!;
    fireEvent.pointerDown(header, { pointerType: 'touch', clientY: 100 });
    fireEvent.pointerUp(header, { pointerType: 'touch', clientY: 260 });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('Tabs', () => {
  it('selects with arrows and links tabs to panels', () => {
    function Harness() {
      const [value, setValue] = useState('frontend');
      return (
        <Tabs
          idBase="armory"
          label="Skill slots"
          value={value}
          onChange={setValue}
          items={[
            { id: 'frontend', label: 'Frontend' },
            { id: 'backend', label: 'Backend' },
          ]}
        />
      );
    }
    render(<Harness />);
    const list = screen.getByRole('tablist', { name: 'Skill slots' });
    expect(screen.getByRole('tab', { name: 'Frontend' })).toHaveAttribute(
      'aria-controls',
      tabIds('armory', 'frontend').panel,
    );
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Backend' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(list, { key: 'End' });
    fireEvent.keyDown(list, { key: 'Home' });
    fireEvent.keyDown(list, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'Backend' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('tab', { name: 'Frontend' }));
    expect(screen.getByRole('tab', { name: 'Frontend' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('ToastViewport', () => {
  it('shows two at most, uses alert for errors, auto-dismisses and pauses on hover', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <ToastViewport
        onDismiss={onDismiss}
        toasts={[
          { id: 1, kind: 'xp', title: '+50 XP' },
          { id: 2, kind: 'error', title: 'Failed', description: 'Try again' },
          { id: 3, kind: 'info', title: 'Hidden for now' },
        ]}
      />,
    );
    expect(screen.queryByText('Hidden for now')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    const xpToast = screen.getByRole('status');
    fireEvent.mouseEnter(xpToast);
    act(() => vi.advanceTimersByTime(5000));
    expect(onDismiss).not.toHaveBeenCalledWith(1);
    fireEvent.mouseLeave(xpToast);
    act(() => vi.advanceTimersByTime(4000));
    expect(onDismiss).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledWith(2);
  });
});

describe('FormField, TextInput, TextArea', () => {
  it('connects label, hint and error to the input', () => {
    render(
      <FormField
        label="Your email"
        hint="We reply here."
        error="This email looks incomplete."
        required
      >
        <TextInput type="email" />
      </FormField>,
    );
    const input = screen.getByLabelText('Your email');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We reply here. This email looks incomplete.');
  });

  it('marks optional fields and counts characters', () => {
    render(
      <FormField label="Company" showOptional>
        <TextArea value={'x'.repeat(12)} maxCount={10} onChange={() => undefined} />
      </FormField>,
    );
    expect(screen.getByText('(optional)')).toBeInTheDocument();
    const counter = screen.getByLabelText('12 of 10 characters');
    expect(counter).toHaveClass('text-hp-300');
  });
});

describe('Tooltip', () => {
  it('appears on focus and hides on blur or Escape', () => {
    render(
      <Tooltip label="Fast Travel">
        <button type="button" aria-label="Fast Travel">
          M
        </button>
      </Tooltip>,
    );
    const button = screen.getByRole('button', { name: 'Fast Travel' });
    vi.useFakeTimers();
    fireEvent.focus(button);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByText('Fast Travel', { selector: 'span' })).toBeInTheDocument();
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(screen.queryByText('Fast Travel', { selector: 'span' })).not.toBeInTheDocument();
    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText('Fast Travel', { selector: 'span' })).toBeInTheDocument();
    fireEvent.pointerLeave(button);
    expect(screen.queryByText('Fast Travel', { selector: 'span' })).not.toBeInTheDocument();
  });
});

describe('EmptyState and ErrorState', () => {
  it('always offers the next step', () => {
    const retry = vi.fn();
    render(
      <>
        <EmptyState
          illustration="log"
          title="A new adventure begins"
          description="Visit a building."
        />
        <ErrorState
          illustration="alert"
          title="Part of the town failed to load"
          action={{ label: 'Try Again', onClick: retry }}
        />
      </>,
    );
    expect(screen.getByText('A new adventure begins')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Part of the town failed to load');
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe('SceneTransition', () => {
  it('calls midpoint then done, faster under reduced motion', () => {
    vi.useFakeTimers();
    const onMidpoint = vi.fn();
    const onDone = vi.fn();
    const { rerender } = render(
      <SceneTransition isActive={false} onMidpoint={onMidpoint} onDone={onDone} />,
    );
    expect(screen.queryByTestId('scene-transition')).not.toBeInTheDocument();
    rerender(<SceneTransition isActive kind="iris" onMidpoint={onMidpoint} onDone={onDone} />);
    expect(screen.getByTestId('scene-transition')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(300));
    expect(onMidpoint).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(300));
    expect(onDone).toHaveBeenCalledOnce();

    const reducedDone = vi.fn();
    render(
      <ReducedMotionProvider value={true}>
        <SceneTransition isActive kind="iris" onDone={reducedDone} />
      </ReducedMotionProvider>,
    );
    act(() => vi.advanceTimersByTime(150));
    expect(reducedDone).toHaveBeenCalledOnce();
  });
});
