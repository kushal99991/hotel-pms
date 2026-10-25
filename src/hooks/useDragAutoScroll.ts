import { useEffect } from "react";
import { useDragLayer } from "react-dnd";

interface UseDragAutoScrollOptions {
  edgeThreshold?: number; // px from viewport edge to start auto-scrolling
  scrollStep?: number; // px per frame
}

/**
 * Auto-scrolls the window while dragging when the pointer is near the
 * top/bottom edges of the viewport. Works with react-dnd.
 */
export default function useDragAutoScroll(options?: UseDragAutoScrollOptions) {
  const { isDragging, clientOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  useEffect(() => {
    if (!isDragging) return;

    let rafId = 0;
    const threshold = options?.edgeThreshold ?? 80;
    const stepPx = options?.scrollStep ?? 24;

    const step = () => {
      const y = clientOffset?.y ?? 0;
      const h = window.innerHeight;

      if (y < threshold) {
        window.scrollBy({ top: -stepPx, behavior: "auto" });
      } else if (y > h - threshold) {
        window.scrollBy({ top: stepPx, behavior: "auto" });
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [isDragging, clientOffset, options?.edgeThreshold, options?.scrollStep]);
}
