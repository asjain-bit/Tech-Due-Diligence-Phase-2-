export interface FilePickerProps {
  /** Accessible name and visible title, e.g. "Upload signed copy" */
  label: string
  /** Supporting line under the title */
  hint?: string
  /** Comma-separated extensions, e.g. ".pdf,.docx" */
  accept: string
  /** Called with the picked file names */
  onPick: (names: string[]) => void
  multiple?: boolean
  className?: string
}
