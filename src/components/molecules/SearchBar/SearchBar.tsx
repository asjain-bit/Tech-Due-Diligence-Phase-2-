import React from 'react'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import type { SearchBarProps } from './SearchBar.types'

/**
 * SearchBar — Molecule
 * Search input field with search icon and quick action button.
 * Used in: SiteHeader, DataTable
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  disabled = false,
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value)
    }
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={`relative flex items-center w-full gap-2 ${className}`.trim()}>
      <div className="relative flex-1 flex items-center">
        <span className="absolute left-3 text-text-placeholder pointer-events-none flex items-center">
          <Icon name="search" size="sm" aria-hidden="true" />
        </span>
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-8"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-2.5 text-text-tertiary hover:text-text-primary p-0.5 cursor-pointer"
          >
            <Icon name="close" size="sm" />
          </button>
        )}
      </div>

      <Button variant="primary" size="md" disabled={disabled} onClick={() => onSearch?.(value)}>
        Search
      </Button>
    </div>
  )
}
