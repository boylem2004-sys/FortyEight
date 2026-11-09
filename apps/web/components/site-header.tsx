import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

/**
 * On Vercel preview deploys, a thin strip says which branch you are looking at.
 * VERCEL_ENV and VERCEL_GIT_COMMIT_REF are set by Vercel at build time.
 * Nothing shows on production or in local dev.
 */
function PreviewStrip() {
  if (process.env.VERCEL_ENV !== "preview") return null;
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  return (
    <div className="bg-warning/15 px-gutter py-1.5 text-center text-xs font-semibold text-foreground [overflow-wrap:anywhere]">
      Preview{branch ? ` of ${branch}` : ""}, not the live site
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <PreviewStrip />
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-gutter">
        <Link href="/" className="rounded-lg" aria-label="FortyEight home">
          <Logo />
        </Link>
        <Button asChild variant="ghost" size="sm">
          <Link href="/plan">Plan a weekend</Link>
        </Button>
      </div>
    </header>
  );
}
