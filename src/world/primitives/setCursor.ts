/** One place to change the mouse cursor from the scene (ARCHITECTURE.md §12.3). */
export const setCursor = (cursor: 'auto' | 'pointer') => {
  if (typeof document !== 'undefined') document.body.style.cursor = cursor;
};
