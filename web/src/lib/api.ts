import { SharpMindApiClient } from '@sharpmind/api-client';
import { getSupabaseClient } from './supabase/client';

let apiClientInstance: SharpMindApiClient | null = null;

export const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, '');
    return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
  }

  // Development fallback when running locally on localhost
  if (
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ) {
    return 'http://localhost:4000/api/v1';
  }

  // Production default origin
  return 'https://api.sharpmind.live/api/v1';
};

export const getApiClient = (): SharpMindApiClient => {
  if (!apiClientInstance) {
    const baseUrl = getApiBaseUrl();

    apiClientInstance = new SharpMindApiClient({
      baseUrl,
      getToken: async () => {
        const supabase = getSupabaseClient();
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
      },
    });
  }
  return apiClientInstance;
};

export const api = getApiClient();
export const apiClient = api;
export default api;
