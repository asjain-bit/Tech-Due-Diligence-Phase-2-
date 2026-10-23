export interface KnowledgeBaseFile {
  name: string
  /** Size in bytes */
  size: number
  /** Where the file comes from, e.g. "M42 knowledge base" or "Uploaded by you" */
  source?: string
}

export interface KnowledgeBaseUploadProps {
  files: KnowledgeBaseFile[]
  onFilesChange: (files: KnowledgeBaseFile[]) => void
  /** Generates the pre-read summary from the selected documents */
  onGenerate: () => void
  /** Opens the initial assessment brief */
  onViewBrief?: () => void
  className?: string
}
