import { useEffect, useState } from 'react'

export interface Weather {
  tempC: number
  code: number
  emoji: string
}

const CACHE_KEY = 'rv_weather_cache'
const CACHE_TTL_MS = 30 * 60 * 1000

// Maps WMO weather interpretation codes to a representative emoji.
function emojiForCode(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3) return '⛅'
  if (code === 45 || code === 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '🌨️'
  if (code >= 80 && code <= 82) return '🌧️'
  if (code >= 85 && code <= 86) return '🌨️'
  if (code >= 95) return '⛈️'
  return '🌡️'
}

interface CacheEntry { weather: Weather; ts: number }

export function useWeather(): { weather: Weather | null; error: string | null } {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry
        if (Date.now() - parsed.ts < CACHE_TTL_MS) {
          setWeather(parsed.weather)
          return
        }
      }
    } catch { /* ignore corrupt cache */ }

    if (!('geolocation' in navigator)) {
      setError('unsupported')
      return
    }

    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
          const res = await fetch(url)
          if (!res.ok) throw new Error('http_' + res.status)
          const data = await res.json() as { current?: { temperature_2m?: number; weather_code?: number } }
          const t = data.current?.temperature_2m
          const c = data.current?.weather_code
          if (typeof t !== 'number' || typeof c !== 'number') throw new Error('bad_payload')
          if (cancelled) return
          const w: Weather = { tempC: Math.round(t), code: c, emoji: emojiForCode(c) }
          setWeather(w)
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ weather: w, ts: Date.now() } satisfies CacheEntry))
          } catch { /* quota — ignore */ }
        } catch {
          if (!cancelled) setError('fetch_failed')
        }
      },
      () => { if (!cancelled) setError('denied') },
      { timeout: 10_000, maximumAge: 60 * 60_000 },
    )

    return () => { cancelled = true }
  }, [])

  return { weather, error }
}
