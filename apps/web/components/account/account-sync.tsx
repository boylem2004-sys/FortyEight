"use client";

import { firstIncompleteStep, preferencesSchema } from "@fortyeight/core";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useAccountStore } from "@/lib/stores/account-store";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Keeps a signed-in person's answers in their account. Renders nothing.
 *
 * - Answers on this device are complete: save them to the account.
 * - This device has no answers yet (new phone, cleared browser): load the
 *   saved ones, so they skip the questions.
 *
 * Does nothing when signed out or when accounts are not set up.
 */
export function AccountSync() {
  const hydrated = useHydrated();
  const draft = useOnboardingStore((s) => s.draft);

  useEffect(() => {
    if (!hydrated) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      useAccountStore.getState().setPendingEmail(null);
      try {
        const local = preferencesSchema.safeParse(draft);
        if (local.success) {
          await api.preferences.put(local.data);
        } else if (firstIncompleteStep(draft) === "location") {
          const saved = await api.preferences.get();
          if (!cancelled && saved.preferences) {
            useOnboardingStore.getState().update(saved.preferences);
          }
        }
      } catch (error) {
        // Not worth interrupting anyone. Answers are still on this device.
        console.error("Syncing saved answers failed", error);
      }
      // Wait for edits to settle, so a burst of changes is one save.
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hydrated, draft]);

  return null;
}
