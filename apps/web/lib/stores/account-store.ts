"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AccountState {
  /** Email we sent a sign-in link to. Set until the person signs in. */
  pendingEmail: string | null;
  /** True once the person said "not now" to saving their answers. */
  nudgeDismissed: boolean;
  setPendingEmail: (email: string | null) => void;
  dismissNudge: () => void;
}

/** Small account flags kept on this device, so we do not nag people twice. */
export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      pendingEmail: null,
      nudgeDismissed: false,
      setPendingEmail: (pendingEmail) => set({ pendingEmail }),
      dismissNudge: () => set({ nudgeDismissed: true }),
    }),
    {
      name: "fortyeight:account",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ pendingEmail: s.pendingEmail, nudgeDismissed: s.nudgeDismissed }),
    },
  ),
);
