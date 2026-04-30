import {
  SunIcon, MoonIcon, DevicePhoneMobileIcon, BellIcon,
  BookOpenIcon, ArrowPathIcon, ShieldCheckIcon,
  ChevronRightIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, SwatchIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'
import { useSettings } from '../hooks/useSettings'
import { useAuth, signOut } from '../hooks/useAuth'
import type { IconComponent, ReaderFont, ReaderTheme, LineSpacing } from '../types'
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

const THEMES = [
  { id: 'dark',  label: 'Dark',  swatch: 'bg-black text-white' },
  { id: 'sepia', label: 'Sepia', swatch: 'bg-[#1a150e] text-[#c8a97e]' },
  { id: 'light', label: 'Light', swatch: 'bg-white text-black' },
] as const satisfies readonly { id: ReaderTheme; label: string; swatch: string }[]
const FONTS = [
  { id: 'system',       label: 'System',       sample: 'Aa' },
  { id: 'georgia',      label: 'Georgia',      sample: 'Aa', family: 'Georgia, serif' },
  { id: 'merriweather', label: 'Merriweather', sample: 'Aa', family: 'Merriweather, Georgia, serif' },
] as const satisfies readonly { id: ReaderFont; label: string; sample: string; family?: string }[]
const SPACINGS = [
  { id: 'compact', label: 'Compact' },
  { id: 'normal',  label: 'Normal'  },
  { id: 'relaxed', label: 'Relaxed' },
] as const satisfies readonly { id: LineSpacing; label: string }[]

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useSettings()
  const { session } = useAuth()
  const {
    darkMode, notifications, dailyReminder, autoSync,
    readerTheme, readerFont, lineSpacing,
  } = settings

  const handleSignOut = async () => {
    if (!confirm('Sign out of ReadVault?')) return
    await signOut()
    navigate('/login', { replace: true })
  }

  const userEmail = session?.user.email ?? 'Reader'

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
        <Divider />

        {/* Theme picker */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <SwatchIcon className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-sm font-medium text-text-primary flex-1">Reader Theme</p>
          </div>
          <div className="flex gap-2 ml-11">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSettings({ readerTheme: t.id })}
                className={`
                  flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                  ${t.swatch}
                  ${readerTheme === t.id ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'opacity-60'}
                `}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Reader */}
      <SectionHeader>Reader</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        {/* Font */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-sm font-medium text-text-primary flex-1">Reading Font</p>
          </div>
          <div className="flex gap-2 ml-11">
            {FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSettings({ readerFont: f.id })}
                style={'family' in f ? { fontFamily: f.family } : undefined}
                className={`
                  flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-150
                  border
                  ${readerFont === f.id
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-white/[0.04] border-white/[0.06] text-text-muted'
                  }
                `}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Line spacing */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
              <BookOpenIcon className="w-4 h-4 text-text-secondary" />
            </div>
            <p className="text-sm font-medium text-text-primary flex-1">Line Spacing</p>
          </div>
          <div className="flex gap-2 ml-11">
            {SPACINGS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSettings({ lineSpacing: s.id })}
                className={`
                  flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border
                  ${lineSpacing === s.id
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-white/[0.04] border-white/[0.06] text-text-muted'
                  }
                `}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <SectionHeader>Notifications</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={BellIcon}
          label="Push Notifications"
          right={<Toggle enabled={notifications} onToggle={() => setSettings({ notifications: !notifications })} />}
        />
        <Divider />
        <SettingsRow
          icon={DevicePhoneMobileIcon}
          label="Daily Reading Reminder"
          description="9:00 PM every day"
          right={<Toggle enabled={dailyReminder} onToggle={() => setSettings({ dailyReminder: !dailyReminder })} />}
        />
      </Card>

      {/* Data */}
      <SectionHeader>Data & Sync</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={ArrowPathIcon}
          label="Auto Sync"
          description="Sync library across devices"
          right={<Toggle enabled={autoSync} onToggle={() => setSettings({ autoSync: !autoSync })} />}
        />
        <Divider />
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
