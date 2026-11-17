import { create } from 'zustand';
import type { LocationId, WindowId } from '@/content/schema';

export type ToastKind = 'achievement' | 'xp' | 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  /** Running XP total for merged xp toasts. */
  amount?: number;
};

export type ModalId = 'reset-confirm';

type UIState = {
  window: WindowId | null;
  /** Open quest when the Quest Board shows a detail page. */
  questId: string | null;
  modal: ModalId | null;
  dialog: { dialogId: string; npcId: string | null; isRepeat: boolean } | null;
  toasts: Toast[];
  /** Location name banner (shown on zone entry). */
  banner: LocationId | null;
  openWindow: (id: WindowId) => void;
  openQuest: (questId: string) => void;
  closeQuest: () => void;
  closeWindow: () => void;
  openModal: (id: ModalId) => void;
  closeModal: () => void;
  openDialog: (dialogId: string, npcId?: string, isRepeat?: boolean) => void;
  closeDialog: () => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  showBanner: (id: LocationId) => void;
  clearBanner: () => void;
};

let nextToastId = 1;

export const useUIStore = create<UIState>()((set, get) => ({
  window: null,
  questId: null,
  modal: null,
  dialog: null,
  toasts: [],
  banner: null,

  // Only one window at a time (COMPONENTS.md §3.4); opening one closes a dialog.
  openWindow: (id) => set({ window: id, questId: null, dialog: null }),
  openQuest: (questId) => set({ window: 'quest-board', questId, dialog: null }),
  closeQuest: () => set({ questId: null }),
  closeWindow: () => set({ window: null, questId: null, modal: null }),
  openModal: (id) => set({ modal: id }),
  closeModal: () => set({ modal: null }),
  openDialog: (dialogId, npcId, isRepeat = false) =>
    set({ dialog: { dialogId, npcId: npcId ?? null, isRepeat } }),
  closeDialog: () => set({ dialog: null }),

  pushToast(toast) {
    const queue = get().toasts;
    const last = queue[queue.length - 1];
    // Back-to-back XP gains become one toast ("+80 XP"), per COMPONENTS.md §3.6.
    if (toast.kind === 'xp' && last?.kind === 'xp') {
      const amount = (last.amount ?? 0) + (toast.amount ?? 0);
      set({ toasts: [...queue.slice(0, -1), { ...last, amount, title: `+${amount} XP` }] });
      return;
    }
    set({ toasts: [...queue, { ...toast, id: nextToastId++ }] });
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
  showBanner: (id) => set({ banner: id }),
  clearBanner: () => set({ banner: null }),
}));

/** World input is paused whenever something covers the town. */
export const selectIsWorldBlocked = (state: Pick<UIState, 'window' | 'modal' | 'dialog'>) =>
  state.window !== null || state.modal !== null || state.dialog !== null;
