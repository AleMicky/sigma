import { Camera } from "lucide-react"

import { FormSection } from "@/shared/components/form-section"
import { ImageUploadField } from "@/shared/components/image-upload-field"

type ActivoFormImageSectionProps = {
  currentUrl?: string | null
  pendingFile: File | null
  onFileChange: (file: File | null) => void
  removeExistingImage: boolean
  onRemoveExistingChange: (remove: boolean) => void
}

export function ActivoFormImageSection({
  currentUrl,
  pendingFile,
  onFileChange,
  removeExistingImage,
  onRemoveExistingChange,
}: ActivoFormImageSectionProps) {
  return (
    <FormSection
      step={4}
      title="Fotografía & Multimedia"
      description="Evidencia visual y ficha fotográfica para reconocimiento en campo."
      icon={Camera}
      columns={1}
    >
      <ImageUploadField
        currentUrl={currentUrl}
        file={pendingFile}
        onFileChange={onFileChange}
        removeExisting={removeExistingImage}
        onRemoveExistingChange={onRemoveExistingChange}
      />
    </FormSection>
  )
}
