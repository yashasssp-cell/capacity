import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Resolve environment variables for both Vite browser client and Node environments
const rawUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  '';

const rawKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
  '';

/**
 * Normalizes user-provided Supabase URLs:
 * - If provided just project ref (e.g. 'iszoqfyjlgesbnogvpbu'), expands to 'https://iszoqfyjlgesbnogvpbu.supabase.co'
 * - If missing protocol (e.g. 'iszoqfyjlgesbnogvpbu.supabase.co'), prepends 'https://'
 * - Validates standard HTTP/HTTPS format and strips trailing slashes/paths to origin
 */
function normalizeSupabaseUrl(input: string | undefined): string {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Matches standalone project ref like 'iszoqfyjlgesbnogvpbu' (alphanumeric, no dots/slashes)
  if (/^[a-z0-9_-]+$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  let withProto = trimmed;
  if (!/^https?:\/\//i.test(withProto)) {
    withProto = `https://${withProto}`;
  }

  try {
    const url = new URL(withProto);
    return url.origin;
  } catch {
    return '';
  }
}

export const supabaseUrl = normalizeSupabaseUrl(rawUrl);
export const supabaseAnonKey = typeof rawKey === 'string' ? rawKey.trim() : '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  !supabaseAnonKey.includes('your-anon-key')
);

if (!isSupabaseConfigured) {
  console.info(
    'Supabase credentials not fully detected or configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable real remote Supabase operations.'
  );
}

// Initialized Supabase client instance with robust fallback so client never crashes
function initSupabase(): SupabaseClient {
  const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const effectiveKey = supabaseAnonKey || 'placeholder-anon-key';

  try {
    return createClient(effectiveUrl, effectiveKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
}

export const supabase = initSupabase();

export default supabase;
