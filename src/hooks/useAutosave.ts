import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../services/api';

export type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

export interface UseAutosaveOptions<T> {
  /** The value that has to be persisted. A new reference means "changed". */
  value: T | null;
  /** Persists the value — the request to the API. */
  save: (value: T) => Promise<void>;
  /** Debounce delay in milliseconds (the plan asks for ~800 ms). */
  delay?: number;
  /** Set to false to pause autosaving (read-only documents, loading state…). */
  enabled?: boolean;
  /** Used in the error message, e.g. "document". */
  label?: string;
}

export interface UseAutosaveResult<T> {
  status: SaveStatus;
  error: string | null;
  savedAt: Date | null;
  /** Save immediately (used by Ctrl+S and the retry button). */
  flush: () => void;
  /**
   * Adopt a value that came from somewhere else (a live update of another
   * editor) — it becomes the new baseline and is **not** saved again.
   */
  sync: (value: T) => void;
}

/**
 * Debounced autosave with a **serialized save queue**.
 *
 * How it behaves:
 *
 * 1. Every change of `value` restarts an 800 ms timer.
 * 2. When the timer fires the value is put into the queue and the queue is
 *    drained — but only **one request is in flight at a time**.
 * 3. While a request is running, newer changes simply replace the queued
 *    value; as soon as the running request finishes the newest value is sent.
 *
 * That combination guarantees that the server always receives the changes in
 * order and that a slow request can never overwrite newer content with older
 * content (no stale responses are applied to the local state either).
 */
export function useAutosave<T>({
  value,
  save,
  delay = 800,
  enabled = true,
  label = 'document',
}: UseAutosaveOptions<T>): UseAutosaveResult<T> {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<T | null>(null);
  const baselineRef = useRef<T | null>(null);
  const inFlightRef = useRef(false);
  const initializedRef = useRef(false);
  const valueRef = useRef<T | null>(value);
  const saveRef = useRef(save);

  valueRef.current = value;
  saveRef.current = save;

  const drainQueue = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    try {
      while (pendingRef.current !== null) {
        const next = pendingRef.current;
        pendingRef.current = null;

        setStatus('saving');
        setError(null);

        try {
          await saveRef.current(next);
          setSavedAt(new Date());
        } catch (saveError) {
          // Keep the value in the queue so the retry button can send it again —
          // unless a newer value arrived meanwhile, which must not be lost.
          if (pendingRef.current === null) {
            pendingRef.current = next;
          }
          setError(getErrorMessage(saveError, `Could not save the ${label}.`));
          setStatus('error');
          return;
        }
      }

      setStatus('saved');
    } finally {
      inFlightRef.current = false;
    }
  }, [label]);

  /* Debounce: restart the timer on every change. ------------------------ */
  useEffect(() => {
    if (!enabled || value === null) return undefined;

    // The first value is the state that was loaded — it must not be saved.
    if (!initializedRef.current) {
      initializedRef.current = true;
      baselineRef.current = value;
      return undefined;
    }

    // The value is identical to the last known state (e.g. a live update of
    // another editor was adopted) — nothing to save.
    if (value === baselineRef.current) return undefined;

    pendingRef.current = value;
    setStatus((current) => (current === 'saving' ? 'saving' : 'dirty'));

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      void drainQueue();
    }, delay);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, enabled, drainQueue]);

  /* Adopt a value that came from somewhere else. ----------------------- */
  const sync = useCallback((next: T) => {
    baselineRef.current = next;
    pendingRef.current = null;
    initializedRef.current = true;
    setStatus('saved');
    setError(null);
  }, []);

  /* Save right away (Ctrl+S, retry button). ----------------------------- */
  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (valueRef.current !== null) {
      pendingRef.current = valueRef.current;
    }
    void drainQueue();
  }, [drainQueue]);

  return { status, error, savedAt, flush, sync };
}

export default useAutosave;
