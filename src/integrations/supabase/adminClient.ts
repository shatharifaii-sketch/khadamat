import { config } from "@/config";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(config.API_URL, config.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-placeholder');