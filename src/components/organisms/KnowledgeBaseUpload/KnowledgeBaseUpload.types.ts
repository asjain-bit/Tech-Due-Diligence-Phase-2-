export interface KnowledgeBaseFile {
  name: string
  /** Size in bytes */
  size: number
  /** Where the file comes from, e.g. "Uploaded by you" */
  source?: string
}

export interface KnowledgeBaseUploadProps {
  /** Documents added so far */
  files: KnowledgeBaseFile[]
  onFilesChange: (files: KnowledgeBaseFile[]) => void
  /** Generates the pre-read summary, with or without documents */
  onGenerate: () => void
  className?: string
}
