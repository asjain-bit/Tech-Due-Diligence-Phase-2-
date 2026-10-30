export interface ToastProps {
  title: string
  description?: string
  type?: 'success' | 'warning' | 'error' | 'info'
  onDismiss?: () => void
  className?: string
}
