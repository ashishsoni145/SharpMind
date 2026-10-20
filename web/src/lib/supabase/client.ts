import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

declare global {
  interface Window {
    sharpMindDesktop?: {
      authStorage?: {
        getItem(key: string): Promise<string | null>;
        setItem(key: string, value: string): Promise<void>;
        removeItem(key: string): Promise<void>;
      };
      authRedirectUrl(kind: 'signup' | 'password-reset'): string;
    };
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        ...(typeof window !== 'undefined' && window.sharpMindDesktop?.authStorage
          ? { storage: window.sharpMindDesktop.authStorage }
          : {}),
      },
    });
  }

  return supabaseInstance;
}
