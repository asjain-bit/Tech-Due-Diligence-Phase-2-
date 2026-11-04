import React from 'react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  pageSize?: number
  className?: string
}
