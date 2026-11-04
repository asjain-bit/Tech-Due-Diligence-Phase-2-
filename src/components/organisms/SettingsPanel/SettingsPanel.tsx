import React, { useState } from 'react'
import { FormField } from '@/components/molecules/FormField'
import { Input } from '@/components/atoms/Input'
import { Textarea } from '@/components/atoms/Textarea'
import { Select } from '@/components/atoms/Select'
import { Button } from '@/components/atoms/Button'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { Avatar } from '@/components/atoms/Avatar'
import { Icon } from '@/components/atoms/Icon'
import type { SettingsPanelProps, UserSettings } from './SettingsPanel.types'

const defaultValues: UserSettings = {
  username: 'alex.rivera',
  email: 'alex.rivera@enterprise.internal',
  bio: 'Platform Engineer focusing on distributed infrastructure and Kubernetes observability.',
  region: 'us-east-1',
  notifications: 'all',
}

/**
 * SettingsPanel — Organism
 * Configuration and user preferences panel with form controls and save actions.
 * Used in: AppShell, page
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSettings,
  onSave,
  onReset,
  className = '',
}) => {
  const [settings, setSettings] = useState<UserSettings>({
    ...defaultValues,
    ...initialSettings,
  })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave?.(settings)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleReset = () => {
    setSettings(defaultValues)
    onReset?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-6 rounded-xl border border-border-default bg-bg-surface-1 p-6 ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border-default pb-4">
        <div>
          <h2 className="text-base font-medium text-text-primary">Workspace Profile</h2>
          <p className="text-xs text-text-tertiary">
            Manage your account identity and telemetry configuration.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <Avatar fallback={settings.username} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField id="username" label="Username" required helperText="Unique account moniker.">
          <Input
            id="username"
            value={settings.username}
            onChange={(e) => setSettings((s) => ({ ...s, username: e.target.value }))}
            placeholder="e.g. jdoe"
          />
        </FormField>

        <FormField
          id="email"
          label="Email Address"
          required
          helperText="System notifications destination."
        >
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))}
            placeholder="e.g. user@org.com"
          />
        </FormField>
      </div>

      <FormField
        id="bio"
        label="Role Description"
        helperText="Brief summary of duties and responsibilities."
      >
        <Textarea
          id="bio"
          rows={3}
          value={settings.bio}
          onChange={(e) => setSettings((s) => ({ ...s, bio: e.target.value }))}
          placeholder="Brief summary..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="region"
          label="Primary Region"
          helperText="Default datacenter deployment zone."
        >
          <Select
            id="region"
            value={settings.region}
            onChange={(e) => setSettings((s) => ({ ...s, region: e.target.value }))}
            options={[
              { value: 'us-east-1', label: 'US East (N. Virginia)' },
              { value: 'us-west-2', label: 'US West (Oregon)' },
              { value: 'eu-west-1', label: 'EU (Ireland)' },
              { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
            ]}
          />
        </FormField>

        <FormField
          id="notifications"
          label="Notification Level"
          helperText="Alert distribution threshold."
        >
          <Select
            id="notifications"
            value={settings.notifications}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                notifications: e.target.value as UserSettings['notifications'],
              }))
            }
            options={[
              { value: 'all', label: 'All Alerts (Verbose)' },
              { value: 'critical', label: 'Critical Only' },
              { value: 'none', label: 'Mute Notifications' },
            ]}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border-default flex-wrap gap-3">
        {savedSuccess ? (
          <span className="flex items-center gap-1.5 text-xs font-medium text-status-success-text">
            <Icon name="check" size="sm" aria-hidden="true" />
            <span>Preferences saved successfully.</span>
          </span>
        ) : (
          <span className="text-xs text-text-tertiary">All modifications are auditable.</span>
        )}

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" variant="primary" size="md">
            Save Preferences
          </Button>
        </div>
      </div>
    </form>
  )
}
