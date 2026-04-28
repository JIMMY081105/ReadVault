import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeftIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  PlusIcon,
  ClockIcon,
  BookOpenIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { booksStore } from '../db/books'
import { getContent } from '../db/content'
import { useSettings } from '../hooks/useSettings'
import { FONT_FAMILY, LINE_HEIGHT } from '../db/settings'

const FONT_SIZES = [14, 16, 18, 20, 22]

const THEMES = [
  { id: 'dark',  bg: 'bg-black',         text: 'text-[#e8e8e8]', label: 'Dark'  },
  { id: 'sepia', bg: 'bg-[#1a150e]',     text: 'text-[#c8a97e]', label: 'Sepia' },
  { id: 'light', bg: 'bg-[#fafafa]',     text: 'text-[#1a1a1a]', label: 'Light' },
]

function themeIndexById(id) {
  const i = THEMES.findIndex((t) => t.id === id)
  return i === -1 ? 0 : i
}

function getLocalDateKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function formatMinutes(value) {
  const minutes = Math.max(0, Math.floor(Number(value) || 0))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours && rest) return `${hours}h ${rest}m`
  if (hours) return `${hours}h`
  return `${rest}m`
}

function readPositiveInteger(value) {
  return Math.max(0, Math.floor(Number(value) || 0))
}

function ReadingNumberInput({
  value,
  onChange,
  placeholder,
  min = 1,
  max,
  ariaLabel,
}) {
  const numericValue = Number(value)
  const hasValue = value !== '' && Number.isFinite(numericValue)
  const currentValue = hasValue ? Math.floor(numericValue) : min - 1
  const upperLimit = Number.isFinite(max) ? max : Infinity
  const canStepUp = upperLimit >= min && currentValue < upperLimit
  const canStepDown = hasValue && currentValue > min

  const stepValue = (delta) => {
    const next = Math.min(Math.max(currentValue + delta, min), upperLimit)
    if (Number.isFinite(next)) onChange(String(next))
  }

  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="number"
        min={min}
        max={Number.isFinite(max) ? max : undefined}
        inputMode="numeric"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          number-input-clean w-full bg-black/30 border border-white/[0.08] rounded-2xl
          py-2.5 pl-3 pr-14 text-sm text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-accent/40 focus:shadow-glow-sm
          transition-[border-color,box-shadow]
        "
      />
      <div
        className="
          absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 flex-col overflow-hidden rounded-xl
          border border-accent/25 bg-gradient-to-b from-accent/25 via-indigo-500/20 to-cyan-400/15
          shadow-glow-sm backdrop-blur-sm
        "
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Increase ${ariaLabel.toLowerCase()}`}
          onClick={() => stepValue(1)}
          disabled={!canStepUp}
          className="flex flex-1 items-center justify-center text-accent transition-colors hover:bg-white/10 active:bg-accent/20 disabled:text-text-muted disabled:opacity-35"
        >
          <ChevronUpIcon className="h-3.5 w-3.5" />
        </button>
        <div className="h-px bg-accent/20" />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Decrease ${ariaLabel.toLowerCase()}`}
          onClick={() => stepValue(-1)}
          disabled={!canStepDown}
          className="flex flex-1 items-center justify-center text-accent transition-colors hover:bg-white/10 active:bg-accent/20 disabled:text-text-muted disabled:opacity-35"
        >
          <ChevronDownIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [settings, setSettings] = useSettings()
  const [bookState, setBookState] = useState(() => booksStore.getById(id))
  const [fontIdx, setFontIdx] = useState(1)
  const [themeIdx, setThemeIdx] = useState(() => themeIndexById(settings.readerTheme))
  const [bookmarked, setBookmarked] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [pageEntry, setPageEntry] = useState('')
  const [timeEntry, setTimeEntry] = useState('')

  // Keep the Reader's theme in sync if the user changes it from Settings.
  useEffect(() => {
    setThemeIdx(themeIndexById(settings.readerTheme))
  }, [settings.readerTheme])

  const content = getContent(id)
  const introduction = content?.chapters?.[0] ?? null
  const currentTheme = THEMES[themeIdx]
  const currentFontSize = FONT_SIZES[fontIdx]
  const todayStats = bookState?.dailyStats?.[getLocalDateKey()] ?? { pages: 0, timeMinutes: 0 }

  if (!bookState) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-text-primary font-semibold">Book not found</p>
        <button onClick={() => navigate('/library')} className="text-sm text-accent">
          Back to Library
        </button>
      </div>
    )
  }

  const progress = bookState.progress ?? 0
  const totalPages = bookState.totalPages ?? 0
  const remainingPages = Math.max(0, totalPages - progress)
  const progressPct = totalPages ? Math.min(100, Math.round((progress / totalPages) * 100)) : 0
  const totalMinutes = bookState.timeSpentMinutes ?? 0
  const estimatedBookMinutes = Math.max(totalPages * 2, totalMinutes, 1)
  const timePct = Math.min(100, Math.round((totalMinutes / estimatedBookMinutes) * 100))
  const requestedPages = readPositiveInteger(pageEntry)
  const requestedMinutes = readPositiveInteger(timeEntry)
  const canAddPages = requestedPages > 0 && requestedPages <= remainingPages
  const canAddTime = requestedMinutes > 0

  const refreshBook = (updated) => {
    if (updated) setBookState({ ...updated })
  }

  const addPages = () => {
    if (!canAddPages) return
    refreshBook(booksStore.addReadingSession(id, { pages: requestedPages }))
    setPageEntry('')
  }

  const addTime = () => {
    if (!canAddTime) return
    refreshBook(booksStore.addReadingSession(id, { minutes: requestedMinutes }))
    setTimeEntry('')
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col transition-colors duration-300`}>
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4
          ${currentTheme.bg}/90 backdrop-blur-xl border-b border-white/[0.05]
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))', paddingBottom: '0.75rem' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
        >
          <ChevronLeftIcon className={`w-5 h-5 ${currentTheme.text}`} />
        </button>

        <div className="text-center flex-1 mx-4 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{bookState.title}</p>
          <p className="text-2xs text-text-muted">
            Introduction · {progress} of {totalPages} pages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
          >
            {bookmarked
              ? <BookmarkSolid className="w-5 h-5 text-accent" />
              : <BookmarkIcon className={`w-5 h-5 ${currentTheme.text}`} />
            }
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
          >
            <AdjustmentsHorizontalIcon className={`w-5 h-5 ${currentTheme.text}`} />
          </button>
        </div>
      </div>

      <main
        className="flex-1 overflow-y-auto px-6 cursor-pointer"
        style={{
          paddingTop: 'calc(5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))',
        }}
        onClick={() => {
          setShowControls(!showControls)
          if (showSettings) setShowSettings(false)
        }}
      >
        <div className="max-w-prose mx-auto">
          <section className="min-h-[calc(100vh-11rem)] flex flex-col justify-center gap-5 py-6">
            <div className="flex items-start gap-4">
              <div className={`w-20 h-28 rounded-2xl flex-shrink-0 shadow-elevated ${bookState.gradient}`}>
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpenIcon className="w-8 h-8 text-white/35" />
                </div>
              </div>
              <div className="min-w-0 pt-1">
                <p className="text-2xs text-accent font-semibold uppercase tracking-widest mb-1">
                  Today
                </p>
                <h1 className={`text-2xl font-bold leading-tight ${currentTheme.text}`}>
                  {bookState.title}
                </h1>
                <p className="text-sm text-text-muted mt-1 truncate">{bookState.author}</p>
                <p className="text-xs text-text-muted mt-3 leading-relaxed line-clamp-3">
                  {bookState.description}
                </p>
              </div>
            </div>

            <div
              className="rounded-3xl bg-white/[0.04] border border-white/[0.07] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Pages read</p>
                  <p className={`text-xl font-bold mt-1 ${currentTheme.text}`}>
                    {progress} / {totalPages}
                  </p>
                </div>
                <span className="text-sm font-semibold text-accent">{progressPct}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <ReadingNumberInput
                  min={1}
                  max={remainingPages}
                  placeholder="Pages today"
                  ariaLabel="Pages read today"
                  value={pageEntry}
                  onChange={setPageEntry}
                />
                <button
                  onClick={addPages}
                  disabled={!canAddPages}
                  className="w-11 h-11 rounded-2xl bg-accent text-black flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Add pages read today"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-2xs text-text-muted mt-2">
                {todayStats.pages ?? 0} pages today · {remainingPages} pages left
              </p>
            </div>

            <div
              className="rounded-3xl bg-white/[0.04] border border-white/[0.07] p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">Reading time</p>
                  <p className={`text-xl font-bold mt-1 ${currentTheme.text}`}>
                    {formatMinutes(totalMinutes)}
                  </p>
                </div>
                <ClockIcon className="w-5 h-5 text-accent" />
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${timePct}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <ReadingNumberInput
                  min={1}
                  placeholder="Minutes today"
                  ariaLabel="Minutes read today"
                  value={timeEntry}
                  onChange={setTimeEntry}
                />
                <button
                  onClick={addTime}
                  disabled={!canAddTime}
                  className="w-11 h-11 rounded-2xl bg-accent text-black flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none"
                  aria-label="Add reading time today"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-2xs text-text-muted mt-2">
                {formatMinutes(todayStats.timeMinutes ?? 0)} today · {formatMinutes(totalPages * 2)} estimated book time
              </p>
            </div>
          </section>

          <section className="min-h-screen pt-8">
            {introduction ? (
              <>
                <div className="mb-8">
                  <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
                    Introduction:
                  </p>
                  <h2 className={`text-2xl font-bold leading-tight mb-1 ${currentTheme.text}`}>
                    {introduction.title}
                  </h2>
                  {introduction.subtitle && (
                    <p className="text-sm text-text-muted">{introduction.subtitle}</p>
                  )}
                </div>

                <div className="h-px bg-white/[0.05] mb-8" />

                <div
                  className={`reading-text ${currentTheme.text} space-y-6`}
                  style={{
                    fontSize: `${currentFontSize}px`,
                    fontFamily: FONT_FAMILY[settings.readerFont],
                    lineHeight: LINE_HEIGHT[settings.lineSpacing],
                  }}
                >
                  {introduction.paragraphs.map((para, i) => (
                    <p key={i} className="opacity-90 leading-relaxed">{para}</p>
                  ))}
                </div>

                <div className="mt-16 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-text-muted">
                    <span className="w-8 h-px bg-white/10" />
                    End of introduction
                    <span className="w-8 h-px bg-white/10" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <div className={`w-20 h-28 rounded-2xl ${bookState.gradient} mb-2`} />
                <p className={`text-lg font-bold ${currentTheme.text}`}>{bookState.title}</p>
                <p className="text-sm text-text-muted max-w-xs">
                  No introduction content yet. Import an EPUB file to start reading.
                </p>
                <button className="mt-2 px-5 py-2.5 rounded-2xl bg-accent/15 border border-accent/30 text-accent text-sm font-semibold">
                  Import EPUB
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {showSettings && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-surface border-t border-white/[0.07] rounded-t-3xl p-6 animate-slide-up"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Font Size</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontIdx(Math.max(0, fontIdx - 1))}
                disabled={fontIdx === 0}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-white/[0.07] flex items-center justify-center text-text-secondary text-base active:scale-95 transition-transform disabled:opacity-30"
              >
                A
              </button>
              <div className="flex-1 flex items-center gap-1">
                {FONT_SIZES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFontIdx(i)}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${i <= fontIdx ? 'bg-accent' : 'bg-white/10'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setFontIdx(Math.min(FONT_SIZES.length - 1, fontIdx + 1))}
                disabled={fontIdx === FONT_SIZES.length - 1}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-white/[0.07] flex items-center justify-center text-text-secondary text-xl font-semibold active:scale-95 transition-transform disabled:opacity-30"
              >
                A
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Background</p>
            <div className="flex gap-3">
              {THEMES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { setThemeIdx(i); setSettings({ readerTheme: t.id }) }}
                  className={`
                    flex-1 py-3 rounded-2xl text-xs font-semibold transition-all
                    ${t.bg} ${t.text}
                    ${themeIdx === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-black' : 'border border-white/10'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          fixed bottom-0 left-0 right-0 z-40 px-6
          transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xs text-text-muted w-8 text-right">{progressPct}%</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-2xs text-text-muted w-12">p.{progress}</span>
        </div>
      </div>
    </div>
  )
}
