import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeftIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { booksStore } from '../db/books'
import { getContent } from '../db/content'

const FONT_SIZES = [14, 16, 18, 20, 22]

const THEMES = [
  { id: 'dark',  bg: 'bg-black',      text: 'text-[#e8e8e8]', label: 'Dark' },
  { id: 'sepia', bg: 'bg-[#1a150e]',  text: 'text-[#c8a97e]', label: 'Sepia' },
  { id: 'slate', bg: 'bg-[#0f1117]',  text: 'text-[#cbd5e1]', label: 'Slate' },
]

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()

  const book = booksStore.getById(id)
  const content = getContent(id)
  const chapter = content?.chapters?.[0] ?? null

  const [fontIdx, setFontIdx]         = useState(1)
  const [themeIdx, setThemeIdx]       = useState(0)
  const [bookmarked, setBookmarked]   = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Track scroll progress and persist it
  const scrollRef = useRef(null)
  const [progress, setProgress] = useState(book?.progress ?? 0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !book) return

    const onScroll = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
      const currentPage = Math.round(pct * book.totalPages)
      setProgress(currentPage)
      booksStore.updateProgress(id, currentPage)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [id, book])

  const currentTheme = THEMES[themeIdx]
  const currentFontSize = FONT_SIZES[fontIdx]
  const progressPct = book ? Math.round((progress / book.totalPages) * 100) : 0

  // Book not found
  if (!book) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-text-primary font-semibold">Book not found</p>
        <button onClick={() => navigate('/library')} className="text-sm text-accent">
          ← Back to Library
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col transition-colors duration-300`}>

      {/* ── Top Bar (tap-to-reveal) ── */}
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
          <p className="text-xs font-semibold text-text-primary truncate">{book.title}</p>
          <p className="text-2xs text-text-muted">
            {chapter ? `Chapter ${chapter.number}` : ''} · Page {progress} of {book.totalPages}
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

      {/* ── Reading Area ── */}
      <main
        ref={scrollRef}
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

          {chapter ? (
            <>
              {/* Chapter heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
                  Chapter {chapter.number}
                </p>
                <h1 className={`text-2xl font-bold leading-tight mb-1 ${currentTheme.text}`}>
                  {chapter.title}
                </h1>
                {chapter.subtitle && (
                  <p className="text-sm text-text-muted">{chapter.subtitle}</p>
                )}
              </div>

              <div className="h-px bg-white/[0.05] mb-8" />

              {/* Body */}
              <div
                className={`reading-text ${currentTheme.text} space-y-6`}
                style={{ fontSize: `${currentFontSize}px` }}
              >
                {chapter.paragraphs.map((para, i) => (
                  <p key={i} className="opacity-90 leading-relaxed">{para}</p>
                ))}
              </div>

              {/* End of chapter nudge */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 text-xs text-text-muted">
                  <span className="w-8 h-px bg-white/10" />
                  End of preview
                  <span className="w-8 h-px bg-white/10" />
                </div>
              </div>
            </>
          ) : (
            /* No content yet — import prompt */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
              <div className={`w-20 h-28 rounded-2xl ${book.gradient} mb-2`} />
              <p className={`text-lg font-bold ${currentTheme.text}`}>{book.title}</p>
              <p className="text-sm text-text-muted max-w-xs">
                No reading content yet. Import an EPUB file to start reading.
              </p>
              <button className="mt-2 px-5 py-2.5 rounded-2xl bg-accent/15 border border-accent/30 text-accent text-sm font-semibold">
                Import EPUB
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-surface border-t border-white/[0.07] rounded-t-3xl p-6 animate-slide-up"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Font Size */}
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

          {/* Theme */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Background</p>
            <div className="flex gap-3">
              {THEMES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setThemeIdx(i)}
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

      {/* ── Bottom Progress Bar ── */}
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
          <span className="text-2xs text-text-muted w-8">p.{progress}</span>
        </div>
      </div>
    </div>
  )
}
