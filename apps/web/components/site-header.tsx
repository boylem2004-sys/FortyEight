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
    <div className="bg-highlight-wash px-gutter py-1.5 text-center text-xs font-semibold text-highlight [overflow-wrap:anywhere]">
      Preview{branch ? ` of ${branch}` : ""}, not the live site
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl">
      <PreviewStrip />
      <div className="mx-auto flex h-11 w-full max-w-5xl items-center justify-between px-gutter">
        <Link href="/" className="rounded-full" aria-label="FortyEight home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5">
          <Link
            href="/#how"
            className="rounded-full text-xs text-foreground/80 transition-colors hover:text-foreground max-sm:hidden"
          >
            How it works
          </Link>
          <Button asChild size="sm">
            <Link href="/plan">Plan a weekend</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
