import { createBrowserClient } from '@supabase/ssr';

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
  isAdmin?: boolean;
};

export function hasSupabasePublicConfig(config: SupabasePublicConfig | null | undefined): config is SupabasePublicConfig {
  return Boolean(config?.url && config.publishableKey);
}

export function createClient(config: SupabasePublicConfig) {
  return createBrowserClient(config.url, config.publishableKey);
}
