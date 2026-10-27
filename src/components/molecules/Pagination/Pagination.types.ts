export interface PaginationProps {
  /** 1-based current page */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}
