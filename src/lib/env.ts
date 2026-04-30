// Centralized, type-safe env-var access. Throws at module load if a required
// var is missing — fast feedback in dev, prevents the app from booting in a
// half-configured state in prod.

interface Env {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var: VITE_${name}. Check .env.local (dev) or Vercel project settings (prod).`)
  }
  return value
}

export const env: Env = {
  SUPABASE_URL: required('SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  SUPABASE_ANON_KEY: required('SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
}
