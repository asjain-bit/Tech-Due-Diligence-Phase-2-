import React from 'react'
import { FileSpreadsheet, FileText, Presentation } from 'lucide-react'

/** Icon coloured by document type: green sheets, orange decks, red PDFs, blue Word files */
export const FileTypeIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext.startsWith('xl')) return <FileSpreadsheet className={`${className} text-[#16a34a]`} />
  if (ext.startsWith('pp')) return <Presentation className={`${className} text-[#ea580c]`} />
  if (ext === 'pdf') return <FileText className={`${className} text-red-500`} />
  return <FileText className={`${className} text-[#2563eb]`} />
}
