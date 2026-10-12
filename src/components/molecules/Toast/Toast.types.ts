export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
  onClose?: () => void
  className?: string
}
