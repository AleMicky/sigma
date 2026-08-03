import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
} from "react"
import { ImageIcon, Trash2, Upload } from "lucide-react"

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const MAX_BYTES = 5 * 1024 * 1024

type ImageUploadFieldProps = {
  label?: string
  currentUrl?: string | null
  file: File | null
  onFileChange: (file: File | null) => void
  removeExisting: boolean
  onRemoveExistingChange: (remove: boolean) => void
  disabled?: boolean
  className?: string
}

export function ImageUploadField({
  label = "Imagen",
  currentUrl,
  file,
  onFileChange,
  removeExisting,
  onRemoveExistingChange,
  disabled,
  className,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const [localError, setLocalError] = useState<string | null>(null)

  const localPreviewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  const showExisting = Boolean(currentUrl) && !removeExisting && !file
  const hasPreview = Boolean(localPreviewUrl) || showExisting

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null
    event.target.value = ""

    if (!next) return

    if (!ACCEPTED_TYPES.includes(next.type as (typeof ACCEPTED_TYPES)[number])) {
      setLocalError("Formato no permitido. Usa JPEG, PNG, WebP o GIF.")
      return
    }

    if (next.size > MAX_BYTES) {
      setLocalError("La imagen no puede superar 5 MB.")
      return
    }

    setLocalError(null)
    onRemoveExistingChange(false)
    onFileChange(next)
  }

  function handleRemove() {
    setLocalError(null)
    if (file) {
      onFileChange(null)
      return
    }
    if (currentUrl) {
      onRemoveExistingChange(true)
    }
  }

  return (
    <Field className={className}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted",
            !hasPreview && "border-dashed",
          )}
        >
          {localPreviewUrl ? (
            <img
              src={localPreviewUrl}
              alt="Vista previa"
              className="size-full object-cover"
            />
          ) : showExisting ? (
            <AuthenticatedImage
              src={currentUrl}
              alt="Imagen actual"
              className="size-full"
              fallbackClassName="size-full"
              fallback={<ImageIcon className="size-5" />}
            />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Input
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            disabled={disabled}
            onChange={handleFileChange}
          />
          <FieldDescription>
            JPEG, PNG, WebP o GIF. Máximo 5 MB.
          </FieldDescription>
          {hasPreview ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="w-fit"
            >
              <Trash2 />
              Quitar imagen
            </Button>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Upload className="size-3.5" />
              Opcional
            </p>
          )}
          {localError ? (
            <p className="text-sm text-destructive">{localError}</p>
          ) : null}
        </div>
      </div>
    </Field>
  )
}
