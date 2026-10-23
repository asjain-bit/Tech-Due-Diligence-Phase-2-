import type { KnowledgeBaseFile } from '@/components/organisms/KnowledgeBaseUpload/KnowledgeBaseUpload.types'

export interface AddDocumentsModalProps {
  /** Called with the files picked in the popup when Add documents is pressed */
  onAdd: (files: KnowledgeBaseFile[]) => void
  onClose: () => void
}
