import { useNavigate } from 'react-router-dom'

/**
 * Displays a single book in the library grid.
 * `book` shape: { id, title, author, cover, progress, totalPages, genre }
 */
export default function BookCard({ book }) {
  const navigate = useNavigate()
  const progressPercent = book.totalPages
    ? Math.round((book.progress / book.totalPages) * 100)
    : 0

  return (
    <div
      onClick={() => navigate(`/reader/${book.id}`)}
      className="group cursor-pointer active:scale-95 transition-transform duration-150"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 shadow-elevated">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Placeholder gradient cover */
          <div className={`w-full h-full flex items-end p-3 ${book.gradient || 'bg-gradient-to-br from-indigo-900/80 to-purple-900/80'}`}>
            <span className="text-xs font-semibold text-white/70 leading-tight line-clamp-3">
              {book.title}
            </span>
          </div>
        )}

        {/* Progress overlay */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Unread badge */}
        {progressPercent === 0 && (
          <div className="absolute top-2 right-2 bg-accent/20 backdrop-blur-sm border border-accent/20 rounded-full px-1.5 py-0.5">
            <span className="text-2xs font-semibold text-accent">New</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="px-0.5">
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 mb-0.5">
          {book.title}
        </h3>
        <p className="text-xs text-text-muted truncate">{book.author}</p>
        {progressPercent > 0 && (
          <p className="text-2xs text-text-muted mt-1">{progressPercent}% read</p>
        )}
      </div>
    </div>
  )
}
