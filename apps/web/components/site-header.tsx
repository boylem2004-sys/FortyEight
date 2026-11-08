import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
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
