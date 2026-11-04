export interface UploadSignedNdaModalProps {
  /** Version the upload will become, shown in the subtitle */
  nextVersion: number
  onUpload: (fileName: string) => void
  onClose: () => void
}
