import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delay` milliseconds — used by the search box so
 * the dashboard does not fire a request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
