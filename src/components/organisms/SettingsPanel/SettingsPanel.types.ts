export interface UserSettings {
  username: string
  email: string
  bio: string
  region: string
  notifications: 'all' | 'critical' | 'none'
}

export interface SettingsPanelProps {
  initialSettings?: Partial<UserSettings>
  onSave?: (settings: UserSettings) => void
  onReset?: () => void
  className?: string
}
