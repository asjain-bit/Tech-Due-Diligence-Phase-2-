import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationProps } from './Pagination.types'

/**
 * Pagination — Molecule
 * Range summary with Previous, numbered pages and Next. Hidden while everything fits on one page.
 * Used in: DashboardScreen
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  className = '',
}) => {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const nav =
    'h-8 min-w-8 px-2 rounded-lg border text-xs font-medium flex items-center justify-center transition'

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-t border-[#e2e8f0] ${className}`.trim()}
    >
      <span className="text-xs text-[#64748b]">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`${nav} border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onPageChange(n)}
            className={`${nav} cursor-pointer ${
              n === page
                ? 'border-[#36c0c9] bg-[#36c0c9] text-white'
                : 'border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className={`${nav} border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`}
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
