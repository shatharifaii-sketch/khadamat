import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient('https://zfnewzekaxofgrindsmb.supabase.co', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'service-role-key-placeholder');