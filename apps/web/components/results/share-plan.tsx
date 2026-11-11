"use client";

import { planShareText, type Plan } from "@fortyeight/core";
import { Check, Share } from "lucide-react";
import { useState } from "react";
import { SaveAnswersDialog } from "@/components/account/save-answers-dialog";
import { Button } from "@/components/ui/button";
import { useAccountStore } from "@/lib/stores/account-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/** True when the person should be offered an account: not signed in, not asked before. */
async function shouldNudge(): Promise<boolean> {
  const { nudgeDismissed, pendingEmail } = useAccountStore.getState();
  if (nudgeDismissed || pendingEmail) return false;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return true;
  const { data } = await supabase.auth.getSession();
  return !data.session;
}

/**
 * Sends the plan to the group: the phone's share sheet where there is one,
 * the clipboard everywhere else. After a share goes out, offers to save the
 * person's answers in an account. That is the only place we ask.
 */
export function SharePlan({ plan }: { plan: Plan }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);

  async function share() {
    setFailed(false);
    const text = planShareText(plan);
    const url = window.location.origin;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Our weekend plan", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 4000);
      }
    } catch (error) {
      // Closing the share sheet is not an error, and not a reason to nudge.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setFailed(true);
      return;
    }
    if (await shouldNudge()) setNudgeOpen(true);
  }

  return (
    <>
      <Button onClick={share}>
        {copied ? <Check aria-hidden /> : <Share aria-hidden />}
        Share with your group
      </Button>
      <p role="status" className="sr-only">
        {copied ? "Plan copied. Paste it in your group chat." : ""}
      </p>
      {copied && (
        <p aria-hidden className="w-full text-sm text-success">
          Plan copied. Paste it in your group chat.
        </p>
      )}
      {failed && (
        <p role="alert" className="w-full text-sm text-destructive">
          Sharing didn&apos;t work on this browser. You can still copy the page link.
        </p>
      )}
      <SaveAnswersDialog open={nudgeOpen} onClose={() => setNudgeOpen(false)} />
    </>
  );
}
