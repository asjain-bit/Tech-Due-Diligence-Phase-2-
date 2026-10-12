import React from 'react'

export interface Column<T> {
  key: keyof T & string
  header: string
  sortable?: boolean
  render?: (row: T) => React.ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  className?: string
}
