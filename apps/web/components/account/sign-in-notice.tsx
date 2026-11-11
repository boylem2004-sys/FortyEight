"use client";

import { useEffect, useState } from "react";

type Notice = "welcome" | "failed" | null;

/** One line after coming back from the emailed sign-in link. */
export function SignInNotice() {
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    // Read from the address bar after load, so the page itself can stay static.
    const params = new URLSearchParams(window.location.search);
    const next: Notice =
      params.get("welcome") === "1"
        ? "welcome"
        : params.get("signin") === "failed"
          ? "failed"
          : null;
    if (!next) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL
    setNotice(next);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  if (notice === "welcome") {
    return (
      <p role="status" className="rounded-2xl bg-card p-4 text-sm">
        <span className="font-semibold text-success">You&apos;re signed in.</span> Your answers are
        saved to your account.
      </p>
    );
  }
  if (notice === "failed") {
    return (
      <p role="alert" className="rounded-2xl bg-highlight-wash p-4 text-sm text-highlight">
        That sign-in link didn&apos;t work. It may have expired. You can still plan without an
        account.
      </p>
    );
  }
  return null;
}
