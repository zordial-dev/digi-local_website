import { useEffect } from 'react';

/**
 * Custom hook to lock body background scrolling when a modal/popup is open.
 * Prevents background scroll wheel/touch scroll while allowing modal content to scroll.
 * @param {boolean} isLocked - Whether background scrolling should be locked
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}

export default useScrollLock;
