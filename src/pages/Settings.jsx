import { useState } from 'react'
import {
  SunIcon, MoonIcon, DevicePhoneMobileIcon, BellIcon,
  BookOpenIcon, ArrowPathIcon, ShieldCheckIcon,
  ChevronRightIcon, ArrowRightOnRectangleIcon,
  UserCircleIcon, SwatchIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../components/PageContainer'
import Card from '../components/Card'

function Toggle({ enabled, onToggle }) {
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

function SettingsRow({ icon: Icon, label, description, right, onClick, danger = false }) {
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

function SectionHeader({ children }) {
  return (
    <p className="text-xs font-semibold text-text-muted uppercase tracking-widest px-4 pt-6 pb-2">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="h-px bg-white/[0.05] mx-4" />
}

const THEMES = ['Dark', 'Sepia', 'Light']
const FONTS = ['System', 'Georgia', 'Merriweather']

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [dailyReminder, setDailyReminder] = useState(true)
  const [autoSync, setAutoSync] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(0)
  const [selectedFont, setSelectedFont] = useState(0)
  const [lineSpacing, setLineSpacing] = useState(1) // 0=compact 1=normal 2=relaxed

  const SPACINGS = ['Compact', 'Normal', 'Relaxed']

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
              <p className="text-base font-semibold text-text-primary">Reader</p>
              <p className="text-sm text-text-muted truncate">Manage your profile</p>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
          </div>
        </Card>
      </div>

      {/* Appearance */}
      <SectionHeader>Appearance</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={darkMode ? MoonIcon : SunIcon}
          label="Dark Mode"
          description="AMOLED black interface"
          right={<Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />}
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
            {THEMES.map((t, i) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(i)}
                className={`
                  flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150
                  ${i === 0 ? 'bg-black text-white' : i === 1 ? 'bg-[#1a150e] text-[#c8a97e]' : 'bg-white text-black'}
                  ${selectedTheme === i ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'opacity-60'}
                `}
              >
                {t}
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
            {FONTS.map((f, i) => (
              <button
                key={f}
                onClick={() => setSelectedFont(i)}
                className={`
                  flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-150
                  border
                  ${selectedFont === i
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-white/[0.04] border-white/[0.06] text-text-muted'
                  }
                `}
              >
                {f}
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
            {SPACINGS.map((s, i) => (
              <button
                key={s}
                onClick={() => setLineSpacing(i)}
                className={`
                  flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border
                  ${lineSpacing === i
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-white/[0.04] border-white/[0.06] text-text-muted'
                  }
                `}
              >
                {s}
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
          right={<Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />}
        />
        <Divider />
        <SettingsRow
          icon={DevicePhoneMobileIcon}
          label="Daily Reading Reminder"
          description="9:00 PM every day"
          right={<Toggle enabled={dailyReminder} onToggle={() => setDailyReminder(!dailyReminder)} />}
        />
      </Card>

      {/* Data */}
      <SectionHeader>Data & Sync</SectionHeader>
      <Card variant="surface" padding={false} className="mx-4 overflow-hidden">
        <SettingsRow
          icon={ArrowPathIcon}
          label="Auto Sync"
          description="Sync library across devices"
          right={<Toggle enabled={autoSync} onToggle={() => setAutoSync(!autoSync)} />}
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
        />
      </Card>

      {/* Version */}
      <p className="text-center text-2xs text-text-muted pb-6">
        ReadVault v0.1.0
      </p>
    </PageContainer>
  )
}
