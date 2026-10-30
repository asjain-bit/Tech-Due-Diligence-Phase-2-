/**
 * DataTable — Organism
 * Column-driven, sortable, paginated data table section with filter control.
 * Used in: SettingsPanel, AppShell, page.tsx
 */

import React, { useState, useMemo } from 'react'
import { Button } from '@/tdd-admin/components/atoms/Button'
import { Select } from '@/tdd-admin/components/atoms/Select'
import { Badge } from '@/tdd-admin/components/atoms/Badge'
import { SearchBar } from '@/tdd-admin/components/molecules/SearchBar'
import { DataTableProps } from './DataTable.types'

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title = 'Data Records',
  pageSize: initialPageSize = 8,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data
    const query = searchQuery.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(query)
      )
    )
  }, [data, searchQuery])

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortKey] ?? '')
      const bVal = String(b[sortKey] ?? '')
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortKey, sortDirection])

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  return (
    <div
      className={[
        'w-full rounded-xl border border-border-default bg-bg-surface-1 overflow-hidden shadow-xs text-text-primary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Table Header Controls */}
      <div className="p-4 border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <Badge variant="neutral">{filteredData.length} Items</Badge>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar
            placeholder="Filter table..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface-2 text-text-secondary text-xs uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold select-none cursor-pointer hover:text-text-primary"
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {sortKey === col.key && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-text-tertiary">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-bg-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-primary">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border-default flex items-center justify-between gap-4 text-xs text-text-tertiary">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            options={[
              { label: '5', value: '5' },
              { label: '10', value: '10' },
              { label: '20', value: '20' },
            ]}
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="h-8 py-0 px-2 text-xs w-16"
          />
        </div>

        <div className="flex items-center gap-3">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
