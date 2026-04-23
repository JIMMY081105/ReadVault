import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeftIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

const SAMPLE_TEXT = `The world is full of objects, more or less interesting; I do not wish to multiply them further. I prefer to let the outstanding object cover its ground surveyed at length.

To prefer one thing to another is the beginning of wisdom. The pragmatic programmer thinks about how code will be maintained long after you've written it. They care about the craft. They don't let the mere passage of time blur the meaning of their work.

Kaizen is a Japanese term that captures the concept of continuously making many small improvements. Every day, work to refine the skills you have and to add new tools to your repertoire. Unlike the rigid production line, which can't accommodate new ideas or improvements, the craft of software development is endlessly malleable.

It's a continuous process of learning and relearning. Care about your craft. Why spend your life developing software unless you care about doing it well? Think about your work. Turn off the autopilot and take control. Constantly critique and appraise your work. This is not meant to be a pain — rather, it is a way of being that becomes natural with time.

Remember the big picture. It's easy to become engrossed in the details of a problem and lose sight of what you're actually trying to accomplish. Always keep the overall context in mind. Don't be overly attached to your first solution — be ready to abandon it and start fresh if the situation demands it.

The greatest of all weaknesses is the fear of appearing weak. The pragmatic programmer is not afraid to say "I don't know, but I'll find out."  Their knowledge and experience are their most important professional assets — but only if they keep learning.`

const FONT_SIZES = [14, 16, 18, 20, 22]

const THEMES = [
  { id: 'dark',   bg: 'bg-black',     text: 'text-[#e8e8e8]', label: 'Dark' },
  { id: 'sepia',  bg: 'bg-[#1a150e]', text: 'text-[#c8a97e]', label: 'Sepia' },
  { id: 'slate',  bg: 'bg-[#0f1117]', text: 'text-[#cbd5e1]', label: 'Slate' },
]

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [fontSize, setFontSize] = useState(1) // index into FONT_SIZES
  const [theme, setTheme] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const currentTheme = THEMES[theme]
  const currentFontSize = FONT_SIZES[fontSize]

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col transition-colors duration-300`}>
      {/* Top Bar */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3
          ${currentTheme.bg}/80 backdrop-blur-xl border-b border-white/[0.05]
          transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
        >
          <ChevronLeftIcon className={`w-5 h-5 ${currentTheme.text}`} />
        </button>

        <div className="text-center flex-1 mx-4">
          <p className="text-xs font-semibold text-text-primary truncate">The Pragmatic Programmer</p>
          <p className="text-2xs text-text-muted">Chapter 4 · Page 142 of 352</p>
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
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
          >
            <AdjustmentsHorizontalIcon className={`w-5 h-5 ${currentTheme.text}`} />
          </button>
        </div>
      </div>

      {/* Reading Area */}
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
          {/* Chapter heading */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
              Chapter 4
            </p>
            <h1 className={`text-2xl font-bold leading-tight mb-1 ${currentTheme.text}`}>
              Pragmatic Paranoia
            </h1>
            <p className="text-sm text-text-muted">You Can't Write Perfect Software</p>
          </div>

          <div className="h-px bg-white/[0.05] mb-8" />

          {/* Body text */}
          <div
            className={`reading-text ${currentTheme.text} space-y-6`}
            style={{ fontSize: `${currentFontSize}px` }}
          >
            {SAMPLE_TEXT.split('\n\n').map((para, i) => (
              <p key={i} className="opacity-90">{para}</p>
            ))}
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      {showSettings && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-surface border-t border-white/[0.07] rounded-t-3xl p-6 animate-slide-up"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Font Size */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
              Font Size
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFontSize(Math.max(0, fontSize - 1))}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-white/[0.07] flex items-center justify-center text-text-secondary text-lg font-light active:scale-95 transition-transform"
                disabled={fontSize === 0}
              >
                A
              </button>

              <div className="flex-1 flex items-center gap-1">
                {FONT_SIZES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFontSize(i)}
                    className={`flex-1 h-1.5 rounded-full transition-colors duration-150 ${
                      i <= fontSize ? 'bg-accent' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setFontSize(Math.min(FONT_SIZES.length - 1, fontSize + 1))}
                className="w-9 h-9 rounded-xl bg-surface-2 border border-white/[0.07] flex items-center justify-center text-text-secondary text-xl font-semibold active:scale-95 transition-transform"
                disabled={fontSize === FONT_SIZES.length - 1}
              >
                A
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
              Background
            </p>
            <div className="flex gap-3">
              {THEMES.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(i)}
                  className={`
                    flex-1 py-3 rounded-2xl text-xs font-semibold transition-all duration-150
                    ${t.bg} ${t.text}
                    ${theme === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-black' : 'border border-white/10'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Progress Bar */}
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-40 px-6 pb-safe-bottom
          transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
        `}
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xs text-text-muted w-8 text-right">40%</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full w-[40%]" />
          </div>
          <span className="text-2xs text-text-muted w-8">p.142</span>
        </div>
      </div>
    </div>
  )
}
