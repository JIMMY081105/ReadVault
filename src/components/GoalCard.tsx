import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import Card from './Card'
import { GOAL_TYPES, formatGoalTitle, formatRecurrenceLabel } from '../utils/goalTypes'

export default function GoalCard({ goal, dateKey, completed, onToggle, onEdit, onDelete }) {
  const meta = GOAL_TYPES[goal.type]
  const recurrenceLabel = formatRecurrenceLabel(goal)

  return (
    <Card variant="surface" padding={false} className={completed ? 'opacity-60' : ''}>
      <div className="flex items-start gap-3 p-3.5">
        <button
          onClick={() => onToggle?.(goal, dateKey, !completed)}
          aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
          className="flex-shrink-0 mt-0.5 active:scale-90 transition-transform"
        >
          {completed
            ? <CheckCircleIcon className="w-6 h-6 text-success" />
            : <div className="w-6 h-6 rounded-full border-2 border-white/20 hover:border-accent/60" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${completed ? 'line-through text-text-muted' : 'text-text-primary'}`}>
            {formatGoalTitle(goal)}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-2xs text-text-muted flex items-center gap-1">
              <span aria-hidden>{meta?.icon}</span>
              {meta?.label}
            </span>
            {recurrenceLabel && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-2xs text-accent">{recurrenceLabel}</span>
              </>
            )}
            {goal.recurrenceEndDate && (
              <>
                <span className="text-text-muted">·</span>
                <span className="text-2xs text-text-muted">until {goal.recurrenceEndDate}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              aria-label="Edit goal"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.05] transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              aria-label="Delete goal"
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
