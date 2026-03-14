import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type UserEmailEventType = 'welcome';

let supabaseAdmin: SupabaseClient<any, "public", "public"> | null = null;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase config');
  supabaseAdmin = createClient<any, "public", "public">(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return supabaseAdmin;
}

/**
 * Check if a user email event has already been recorded (fail open)
 */
export async function hasUserEmailEvent(
  userId: string,
  type: UserEmailEventType
): Promise<boolean> {
  try {
    const client = getSupabaseAdmin();
    const { data, error } = await client
      .from('user_email_events')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();
    if (error) {
      console.error('Error checking user email event:', error);
      return false;
    }
    return data !== null;
  } catch (error) {
    console.error('Exception checking user email event:', error);
    return false;
  }
}

/**
 * Record a user email event (treat 23505 as success)
 */
export async function recordUserEmailEvent(
  userId: string,
  type: UserEmailEventType
): Promise<boolean> {
  try {
    const client = getSupabaseAdmin();
    const { error } = await client
      .from('user_email_events')
      .insert({
        user_id: userId,
        type,
        sent_at: new Date().toISOString(), // assumes sent_at column
      });
    if (error) {
      if (error.code === '23505') {
        console.log(`User email event already exists: ${type} for user ${userId}`);
        return true;
      }
      console.error('Error recording user email event:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Exception recording user email event:', error);
    return false;
  }
}
