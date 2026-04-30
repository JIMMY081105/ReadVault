import { useState } from 'react'
import {
  SunIcon, MoonIcon, BellIcon,
  ShieldCheckIcon,
  ChevronRightIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { useSettings } from '../hooks/useSettings'
import { useAuth, signOut } from '../hooks/useAuth'
import {
  notificationSupported,
  notificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
  fireReminderNotification,
} from '../lib/notifications'
import type { IconComponent } from '../types'
import type { ReactNode } from 'react'

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none no-select
        ${enabled ? 'bg-accent' : 'bg-white/10'}
      `}
    >
      <span className={`
        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
        ${enabled ? 'translate-x-5' : 'translate-x-0'}
      `} />
    </button>
  )
}

interface SettingsRowProps {
  icon: IconComponent
  label: string
  description?: string
  right?: ReactNode
  onClick?: () => void
  danger?: boolean
}

function SettingsRow({ icon: Icon, label, description, right, onClick, danger = false }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 text-left
        transition-colors duration-100 active:bg-white/[0.04]
        ${danger ? 'hover:bg-red-500/5' : 'hover:bg-white/[0.02]'}
      `}
    >
      <div className={`
        w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
        ${danger ? 'bg-red-500/10' : 'bg-white/[0.06]'}
      `}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-text-secondary'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-text-primary'}`}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>
        )}
      </div>

      <div className="flex-shrink-0">
        {right ?? <ChevronRightIcon className="w-4 h-4 text-text-muted" />}
      </div>
    </button>
  )
}

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest px-4 pt-6 pb-2">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px bg-white/[0.05] mx-4" />
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useSettings()
  const { session } = useAuth()
  const { darkMode, dailyReminder } = settings
  const [permState, setPermState] = useState(notificationPermission())

  const handleSignOut = async () => {
    if (!confirm('Sign out of ReadVault?')) return
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleReminderToggle = async () => {
    if (dailyReminder) {
      // Turning off
      cancelDailyReminder()
      setSettings({ dailyReminder: false })
      return
    }

    // Turning on — ensure permission first.
    if (!notificationSupported()) {
      alert('Notifications are not supported in this browser.')
      return
    }

    const result = await requestNotificationPermission()
    setPermState(result)
    if (result !== 'granted') {
      alert(
        result === 'denied'
          ? 'Notifications were blocked. Enable them in browser/Settings → Notifications, then try again.'
          : 'Permission was not granted.'
      )
      return
    }

    scheduleDailyReminder()
    setSettings({ dailyReminder: true })
  }

  const userEmail = session?.user.email ?? 'Reader'

  const reminderDescription =
    permState === 'denied'
      ? 'Notifications blocked — enable in Settings'
      : permState === 'unsupported'
      ? 'Not supported on this device'
      : '9:00 PM every day (when app is open)'

  return (
    <PageContainer flush className="!pt-14">
      {/* Header */}
      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
      </div>

      {/* Profile */}
      <div className="px-4 mb-6">
        <Card variant="elevated" padding={false}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/40 to-purple-600/40 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <UserCircleIcon className="w-8 h-8 text-accent/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-text-primary truncate">{userEmail}</p>
              <p className="text-sm text-text-muted truncate">Signed in</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appearance */}
      <SectionHeader>Appearance</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={darkMode ? MoonIcon : SunIcon}
          label="Dark Mode"
          description={darkMode ? 'AMOLED black interface' : 'Light interface'}
          right={<Toggle enabled={darkMode} onToggle={() => setSettings({ darkMode: !darkMode })} />}
        />
      </Card>

      {/* Notifications */}
      <SectionHeader>Notifications</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={BellIcon}
          label="Daily Reading Reminder"
          description={reminderDescription}
          right={<Toggle enabled={dailyReminder} onToggle={handleReminderToggle} />}
        />
        {dailyReminder && permState === 'granted' && (
          <>
            <Divider />
            <SettingsRow
              icon={BellIcon}
              label="Test notification now"
              description="Sends a sample reminder immediately"
              onClick={fireReminderNotification}
              right={null}
            />
          </>
        )}
      </Card>

      {/* Data */}
      <SectionHeader>Data</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={ShieldCheckIcon}
          label="Privacy Policy"
          description="How your data is used"
        />
      </Card>

      {/* Danger zone */}
      <SectionHeader>Account</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden mb-8">
        <SettingsRow
          icon={ArrowRightOnRectangleIcon}
          label="Sign Out"
          danger
          right={null}
          onClick={handleSignOut}
        />
      </Card>

      {/* Version */}
      <p className="text-center text-2xs text-text-muted pb-6">
        ReadVault v0.1.0
      </p>
    </PageContainer>
  )
}
