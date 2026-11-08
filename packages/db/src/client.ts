import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/** A Supabase client typed against our schema. Works with any key (anon, user JWT, service role). */
export type DbClient = SupabaseClient<Database>;
