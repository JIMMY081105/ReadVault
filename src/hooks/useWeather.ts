import { useEffect, useState } from 'react'

export interface Weather {
  tempC: number
  code: number
  emoji: string
  description: string
  location: string | null
}

const CACHE_KEY = 'rv_weather_cache_v3'
const CACHE_TTL_MS = 30 * 60 * 1000

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

function descriptionForCode(code: number): string {
  switch (code) {
    case 0:  return 'Clear'
    case 1:  return 'Mainly clear'
    case 2:  return 'Partly cloudy'
    case 3:  return 'Overcast'
    case 45: case 48: return 'Foggy'
    case 51: return 'Light drizzle'
    case 53: return 'Drizzle'
    case 55: return 'Heavy drizzle'
    case 56: case 57: return 'Freezing drizzle'
    case 61: return 'Light rain'
    case 63: return 'Rain'
    case 65: return 'Heavy rain'
    case 66: case 67: return 'Freezing rain'
    case 71: return 'Light snow'
    case 73: return 'Snow'
    case 75: return 'Heavy snow'
    case 77: return 'Snow grains'
    case 80: return 'Light showers'
    case 81: return 'Showers'
    case 82: return 'Heavy showers'
    case 85: return 'Light snow showers'
    case 86: return 'Snow showers'
    case 95: return 'Thunderstorm'
    case 96: case 99: return 'Thunderstorm with hail'
    default: return 'Weather'
  }
}

interface CacheEntry { weather: Weather; ts: number }

interface OpenMeteoResp {
  current?: { temperature_2m?: number; weather_code?: number }
}

interface NominatimResp {
  name?: string
  address?: {
    village?: string
    hamlet?: string
    town?: string
    suburb?: string
    neighbourhood?: string
    quarter?: string
    municipality?: string
    city?: string
    county?: string
    state_district?: string
    state?: string
    country?: string
  }
}

async function fetchLocationName(lat: number, lon: number): Promise<string | null> {
  try {
    // zoom=14 ≈ town/suburb precision. Nominatim picks the most specific admin
    // unit at that zoom; we then prefer village/hamlet/town/suburb in the
    // address object before falling back to broader names.
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&accept-language=en`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json() as NominatimResp
    const a = data.address ?? {}
    return (
      a.village ||
      a.hamlet ||
      a.town ||
      a.suburb ||
      a.neighbourhood ||
      a.quarter ||
      a.municipality ||
      a.city ||
      a.county ||
      a.state_district ||
      a.state ||
      data.name ||
      a.country ||
      null
    )
  } catch {
    return null
  }
}

async function fetchWeather(lat: number, lon: number): Promise<{ tempC: number; code: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
  const res = await fetch(url)
  if (!res.ok) throw new Error('http_' + res.status)
  const data = await res.json() as OpenMeteoResp
  const t = data.current?.temperature_2m
  const c = data.current?.weather_code
  if (typeof t !== 'number' || typeof c !== 'number') throw new Error('bad_payload')
  return { tempC: Math.round(t), code: c }
}

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
          const [{ tempC, code }, location] = await Promise.all([
            fetchWeather(latitude, longitude),
            fetchLocationName(latitude, longitude),
          ])
          if (cancelled) return
          const w: Weather = {
            tempC,
            code,
            emoji: emojiForCode(code),
            description: descriptionForCode(code),
            location,
          }
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
