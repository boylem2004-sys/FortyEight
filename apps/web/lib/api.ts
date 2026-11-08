"use client";

import { createApiClient } from "@fortyeight/api-client";

/**
 * Browser API client. Same origin, so the Supabase session cookie rides along
 * and no bearer token is needed. The mobile app passes `getToken` instead.
 */
export const api = createApiClient({ baseUrl: "" });
