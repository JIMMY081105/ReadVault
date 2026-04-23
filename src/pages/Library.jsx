import { useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import BookCard from '../components/BookCard'
import Button from '../components/Button'

const PLACEHOLDER_BOOKS = [
  { id: '1', title: 'The Pragmatic Programmer', author: 'David Thomas', progress: 142, totalPages: 352, gradient: 'bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900', genre: 'Tech' },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', progress: 280, totalPages: 306, gradient: 'bg-gradient-to-br from-orange-900 to-amber-900', genre: 'Self-help' },
  { id: '3', title: 'Deep Work', author: 'Cal Newport', progress: 110, totalPages: 200, gradient: 'bg-gradient-to-br from-slate-800 to-zinc-900', genre: 'Productivity' },
  { id: '4', title: 'SICP', author: 'Abelson & Sussman', progress: 60, totalPages: 657, gradient: 'bg-gradient-to-br from-emerald-900 to-teal-900', genre: 'Tech' },
  { id: '5', title: 'Dune', author: 'Frank Herbert', progress: 0, totalPages: 688, gradient: 'bg-gradient-to-br from-yellow-900 to-orange-950', genre: 'Fiction' },
  { id: '6', title: 'The Design of Everyday Things', author: 'Don Norman', progress: 0, totalPages: 368, gradient: 'bg-gradient-to-br from-rose-900 to-pink-950', genre: 'Design' },
]

const FILTERS = ['All', 'Reading', 'Finished', 'Unread']

export default function Library() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [gridView, setGridView] = useState(true)

  const filtered = PLACEHOLDER_BOOKS.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Reading' && b.progress > 0 && b.progress < b.totalPages) ||
      (activeFilter === 'Finished' && b.progress >= b.totalPages) ||
      (activeFilter === 'Unread' && b.progress === 0)

    return matchSearch && matchFilter
  })

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Library</h1>
        <Button size="icon" variant="surface">
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="search"
          placeholder="Search books or authors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full bg-surface-2 border border-white/[0.07] rounded-2xl
            pl-10 pr-4 py-2.5 text-sm text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-accent/40 focus:bg-surface-3
            transition-colors duration-150
          "
        />
      </div>

      {/* Filters + view toggle */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex gap-2 flex-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`
                flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                ${activeFilter === f
                  ? 'bg-accent text-black shadow-glow-sm'
                  : 'bg-surface-2 text-text-muted border border-white/[0.06] hover:border-white/10'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid / list toggle */}
        <button
          onClick={() => setGridView(!gridView)}
          className="flex-shrink-0 p-2 rounded-xl bg-surface-2 border border-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
        >
          {gridView
            ? <ListBulletIcon className="w-4 h-4" />
            : <Squares2X2Icon className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted mb-4">
        {filtered.length} {filtered.length === 1 ? 'book' : 'books'}
      </p>

      {/* Books */}
      {filtered.length > 0 ? (
        <div className={gridView
          ? 'grid grid-cols-2 gap-5'
          : 'space-y-3'
        }>
          {filtered.map((book) =>
            gridView ? (
              <BookCard key={book.id} book={book} />
            ) : (
              /* List view row */
              <div
                key={book.id}
                className="flex items-center gap-3 bg-surface border border-white/[0.06] rounded-2xl p-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className={`w-10 h-14 rounded-xl flex-shrink-0 ${book.gradient}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{book.title}</p>
                  <p className="text-xs text-text-muted truncate mt-0.5">{book.author}</p>
                  <div className="mt-2 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full"
                      style={{ width: `${book.totalPages ? Math.round((book.progress / book.totalPages) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-2 border border-white/[0.06] flex items-center justify-center mb-4">
            <MagnifyingGlassIcon className="w-7 h-7 text-text-muted" />
          </div>
          <p className="text-text-secondary font-medium">No books found</p>
          <p className="text-sm text-text-muted mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Book FAB */}
      <div className="fixed bottom-24 right-5 z-40" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 1rem)' }}>
        <button className="
          w-14 h-14 rounded-full bg-accent text-black shadow-glow
          flex items-center justify-center
          active:scale-95 transition-transform duration-150
        ">
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </PageContainer>
  )
}
