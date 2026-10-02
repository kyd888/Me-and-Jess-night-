import { useRef } from "react";

/** Pointer handlers that fire `callback` after the finger is held for `ms`. */
export function useLongPress(callback, ms = 1000) {
  const timer = useRef();
  const cancel = () => clearTimeout(timer.current);
  return {
    onPointerDown: () => {
      cancel();
      timer.current = setTimeout(callback, ms);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e) => e.preventDefault(),
  };
}
