import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content py-section text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">That page doesn&apos;t exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
