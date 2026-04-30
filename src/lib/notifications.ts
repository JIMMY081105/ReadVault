// Daily reading reminder.
//
// Limitation: this is client-side scheduling via setTimeout, so the reminder
// only fires when the app is open (browser tab, or PWA in foreground/recent
// background). Once iOS evicts the tab from memory, the timer is gone.
// Reliable background reminders require server-sent Web Push (Vercel Cron +
// VAPID keys + push_subscriptions table) — not yet implemented.

const REMINDER_HOUR = 21
const REMINDER_MINUTE = 0

let scheduledTimerId: number | null = null

export function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!notificationSupported()) return 'unsupported'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationSupported()) return 'denied'
  if (Notification.permission === 'granted' || Notification.permission === 'denied') {
    return Notification.permission
  }
  return await Notification.requestPermission()
}

export function fireReminderNotification(): void {
  if (!notificationSupported() || Notification.permission !== 'granted') return

  const title = 'Time to read 📚'
  const body = 'Open ReadVault to log your reading session.'

  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.ready.then((reg) => {
      void reg.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'rv-daily-reminder',
      })
    })
  } else {
    // eslint-disable-next-line no-new
    new Notification(title, { body })
  }
}

function nextReminderDelayMs(): number {
  const now = new Date()
  const next = new Date(now)
  next.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0)
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

export function scheduleDailyReminder(): void {
  cancelDailyReminder()
  if (!notificationSupported() || Notification.permission !== 'granted') return

  const tick = () => {
    fireReminderNotification()
    // Re-schedule for the next day after firing.
    scheduledTimerId = window.setTimeout(tick, nextReminderDelayMs())
  }
  scheduledTimerId = window.setTimeout(tick, nextReminderDelayMs())
}

export function cancelDailyReminder(): void {
  if (scheduledTimerId !== null) {
    clearTimeout(scheduledTimerId)
    scheduledTimerId = null
  }
}
