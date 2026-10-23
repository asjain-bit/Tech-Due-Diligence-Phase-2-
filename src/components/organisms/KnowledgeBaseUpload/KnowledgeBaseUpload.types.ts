export interface KnowledgeBaseFile {
  name: string
  /** Size in bytes */
  size: number
}

export interface KnowledgeBaseUploadProps {
  files: KnowledgeBaseFile[]
  onFilesChange: (files: KnowledgeBaseFile[]) => void
  /** Generates the pre-read summary, with or without files */
  onGenerate: () => void
  className?: string
}
