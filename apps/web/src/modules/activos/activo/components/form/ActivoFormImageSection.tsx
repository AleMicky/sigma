import { Camera } from "lucide-react"

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
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b">
        <Camera className="size-4 text-primary" />
        <h2 className="font-heading font-semibold text-base">
          Fotografía del Activo
        </h2>
      </div>
      <ImageUploadField
        currentUrl={currentUrl}
        file={pendingFile}
        onFileChange={onFileChange}
        removeExisting={removeExistingImage}
        onRemoveExistingChange={onRemoveExistingChange}
      />
    </div>
  )
}
