"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server render and hydration, true after. Use it to hold back
 * UI that depends on device storage, so the first client render matches the
 * server and React does not throw a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
