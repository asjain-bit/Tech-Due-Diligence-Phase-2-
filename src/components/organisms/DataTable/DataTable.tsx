import React, { useState, useMemo } from 'react'
import { SearchBar } from '@/components/molecules/SearchBar'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import { Icon } from '@/components/atoms/Icon'
import type { DataTableProps, Column } from './DataTable.types'

/**
 * DataTable — Organism
 * Column-driven tabular data grid with client-side sorting, search filtering, and pagination.
 * Used in: SettingsPanel, page
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize: initialPageSize = 5,
  searchable = true,
  searchPlaceholder = 'Filter records...',
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<(keyof T & string) | null>(null)
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
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal)
      const bStr = String(bVal)
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filteredData, sortKey, sortDirection])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return
    if (sortKey === col.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortKey(null)
        setSortDirection('asc')
      }
    } else {
      setSortKey(col.key)
      setSortDirection('asc')
    }
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface-1 p-4 ${className}`.trim()}
    >
      {searchable && (
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-xs w-full">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
            />
          </div>
          <span className="text-xs text-text-tertiary">
            Showing {paginatedData.length} of {sortedData.length} records
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-default">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-default bg-bg-surface-2">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 font-medium text-text-primary text-xs uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-bg-hover' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.key && (
                      <span className="text-text-accent flex items-center">
                        <Icon
                          name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'}
                          size="sm"
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-text-tertiary text-sm"
                >
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-bg-hover transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-text-secondary">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Rows per page:</span>
          <div className="w-20">
            <Select
              aria-label="Rows per page"
              selectSize="sm"
              value={String(pageSize)}
              onChange={handlePageSizeChange}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '25', label: '25' },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <Icon name="chevron-left" size="sm" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <Icon name="chevron-right" size="sm" />
          </Button>
        </div>
      </div>
    </div>
  )
}
