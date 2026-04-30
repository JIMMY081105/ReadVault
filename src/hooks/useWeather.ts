import { useEffect, useState } from 'react'

export interface Weather {
  tempC: number
  code: number
  emoji: string
  description: string
  location: string | null
}

const CACHE_KEY = 'rv_weather_cache_v4'
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

async function fetchJson<T>(url: string, timeoutMs = 6000, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) throw new Error('http_' + res.status)
    return await res.json() as T
  } finally {
    clearTimeout(timer)
  }
}

// ── Coordinate sources ──────────────────────────────────────────────────────

async function getBrowserCoords(): Promise<{ lat: number; lon: number } | null> {
  if (!('geolocation' in navigator)) return null
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60 * 60_000 },
    )
  })
}

interface IpwhoResp {
  success?: boolean
  latitude?: number
  longitude?: number
  city?: string
  region?: string
  country?: string
}

// IP-based geolocation: works without permission. Coarse (city level).
// ipwho.is is keyless, HTTPS, accessible from China.
async function getIpCoords(): Promise<{ lat: number; lon: number; name: string | null } | null> {
  try {
    const data = await fetchJson<IpwhoResp>('https://ipwho.is/', 6000)
    if (data.success === false) return null
    if (typeof data.latitude !== 'number' || typeof data.longitude !== 'number') return null
    const name = data.city || data.region || data.country || null
    return { lat: data.latitude, lon: data.longitude, name }
  } catch {
    return null
  }
}

// ── Weather ─────────────────────────────────────────────────────────────────

interface OpenMeteoResp {
  current?: { temperature_2m?: number; weather_code?: number }
}

async function fetchWeather(lat: number, lon: number): Promise<{ tempC: number; code: number }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
  const data = await fetchJson<OpenMeteoResp>(url, 7000)
  const t = data.current?.temperature_2m
  const c = data.current?.weather_code
  if (typeof t !== 'number' || typeof c !== 'number') throw new Error('bad_payload')
  return { tempC: Math.round(t), code: c }
}

// ── Location name (reverse geocoding) ───────────────────────────────────────

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

interface BdcResp {
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
}

async function fetchLocationName(lat: number, lon: number): Promise<string | null> {
  // 1) Nominatim — most precise (village/hamlet level), but slow/blocked in some regions.
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&accept-language=en`
    const data = await fetchJson<NominatimResp>(url, 4500, { headers: { Accept: 'application/json' } })
    const a = data.address ?? {}
    const name =
      a.village || a.hamlet || a.town || a.suburb || a.neighbourhood || a.quarter ||
      a.municipality || a.city || a.county || a.state_district || a.state || data.name
    if (name) return name
  } catch { /* try fallback */ }

  // 2) BigDataCloud — keyless, accessible globally including China.
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    const data = await fetchJson<BdcResp>(url, 4500)
    return data.locality || data.city || data.principalSubdivision || data.countryName || null
  } catch { /* give up */ }

  return null
}

// ── Hook ────────────────────────────────────────────────────────────────────

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

    let cancelled = false

    void (async () => {
      // Coords: try browser geolocation first (precise), then IP-based (no permission needed).
      let lat: number, lon: number
      let ipName: string | null = null

      const browserCoords = await getBrowserCoords()
      if (browserCoords) {
        lat = browserCoords.lat
        lon = browserCoords.lon
      } else {
        const ip = await getIpCoords()
        if (!ip) {
          if (!cancelled) setError('no_location')
          return
        }
        lat = ip.lat
        lon = ip.lon
        ipName = ip.name
      }

      try {
        const [w, name] = await Promise.all([
          fetchWeather(lat, lon),
          fetchLocationName(lat, lon),
        ])
        if (cancelled) return
        const result: Weather = {
          tempC: w.tempC,
          code: w.code,
          emoji: emojiForCode(w.code),
          description: descriptionForCode(w.code),
          location: name || ipName,
        }
        setWeather(result)
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ weather: result, ts: Date.now() } satisfies CacheEntry))
        } catch { /* quota — ignore */ }
      } catch {
        if (!cancelled) setError('fetch_failed')
      }
    })()

    return () => { cancelled = true }
  }, [])

  return { weather, error }
}
