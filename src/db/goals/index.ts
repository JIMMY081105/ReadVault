// Public goals API. Pages import { goalsStore } from '../db/goals' and the
// folder-as-module resolution finds this file.

import { isGoalActiveOnDate, isGoalCompletedOnDate } from './recurrence'
import { loadGoals } from './storage'
import {
  createGoal,
  updateGoal,
  deleteGoal,
  markGoalCompletedForDate,
  getGoalsForDate,
  stopRecurringGoal,
} from './crud'
import type { Goal } from '../../types'

export const goalsStore = {
  getAll: (): Goal[] => loadGoals(),
  getById: (id: string): Goal | null => loadGoals().find((g) => g.id === id) ?? null,
  getForDate: getGoalsForDate,
  create: createGoal,
  update: updateGoal,
  delete: deleteGoal,
  markCompleted: markGoalCompletedForDate,
  stopRecurring: stopRecurringGoal,
  isActiveOn: isGoalActiveOnDate,
  isCompletedOn: isGoalCompletedOnDate,
}

export { isGoalActiveOnDate, isGoalCompletedOnDate }
