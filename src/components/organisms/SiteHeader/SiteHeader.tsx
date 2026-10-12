import React, { useState } from 'react'
import { ThemeToggle } from '@/components/atoms/ThemeToggle'
import { Avatar } from '@/components/atoms/Avatar'
import { SearchBar } from '@/components/molecules/SearchBar'
import type { SiteHeaderProps } from './SiteHeader.types'

/**
 * SiteHeader — Organism
 * Top navigation header containing branding, search, navigation links, and user theme controls.
 * Used in: AppShell, page
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({
  title = 'Platform Console',
  links = [],
  user,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  className = '',
}) => {
  const [internalSearch, setInternalSearch] = useState(searchValue)

  const handleSearchChange = (val: string) => {
    setInternalSearch(val)
    onSearchChange?.(val)
  }

  return (
    <header
      className={`h-[56px] w-full px-4 border-b border-border-default bg-bg-surface-1 flex items-center justify-between gap-4 select-none ${className}`.trim()}
    >
      <div className="flex items-center gap-6 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-md bg-action-primary-bg-default flex items-center justify-center text-action-primary-text font-bold text-xs tracking-wider">
            TDD
          </div>
          <span className="font-semibold text-sm text-text-primary tracking-tight truncate">
            {title}
          </span>
        </div>

        {links.length > 0 && (
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  link.active
                    ? 'bg-bg-selected text-text-accent font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="w-48 lg:w-64 hidden sm:block">
          <SearchBar
            value={onSearchChange ? searchValue : internalSearch}
            onChange={handleSearchChange}
            onSearch={onSearchSubmit}
            placeholder="Search console..."
          />
        </div>

        <ThemeToggle size="sm" />

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border-default">
            <Avatar src={user.avatarUrl} fallback={user.name} size="sm" />
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-text-primary leading-tight">
                {user.name}
              </span>
              {user.role && (
                <span className="text-[10px] text-text-tertiary leading-tight">{user.role}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
