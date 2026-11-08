import { healthResponseSchema } from "@fortyeight/core";
import { jsonOk } from "@/lib/server/http";
import pkg from "@/package.json";

export const dynamic = "force-dynamic";

export function GET() {
  return jsonOk(healthResponseSchema, {
    ok: true,
    version: pkg.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
