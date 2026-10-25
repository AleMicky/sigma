import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import { ImagePlus, RefreshCw, Trash2, Upload } from "lucide-react"

import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/shared/components/ui/field"

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
  label = "Fotografía",
  currentUrl,
  file,
  onFileChange,
  removeExisting,
  onRemoveExistingChange,
  disabled,
  className,
}: ImageUploadFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
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

      {/* Hidden file input triggered by custom buttons */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        disabled={disabled}
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
      />

      {hasPreview ? (
        <div className="flex flex-col gap-3">
          {/* Contenedor de imagen visible con proporción clara */}
          <div className="relative w-full h-44 sm:h-48 overflow-hidden rounded-xl border border-border/80 bg-muted/30 p-1.5 flex items-center justify-center shadow-2xs group">
            {localPreviewUrl ? (
              <img
                src={localPreviewUrl}
                alt="Vista previa de activo"
                className="size-full object-contain drop-shadow-xs"
              />
            ) : (
              <AuthenticatedImage
                src={currentUrl}
                alt="Fotografía del activo"
                className="size-full object-contain drop-shadow-xs"
                fallbackClassName="size-full flex items-center justify-center"
                fallback={<ImagePlus className="size-8 text-muted-foreground/60" />}
              />
            )}
          </div>

          {/* Botones de acción con texto completo sin cortar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              className="flex-1 min-w-[120px] gap-1.5 text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Cambiar imagen</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="gap-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/30 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Quitar</span>
            </Button>
          </div>

          <FieldDescription className="text-[11px]">
            JPEG, PNG, WebP o GIF. Tamaño máximo de 5 MB.
          </FieldDescription>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Dropzone interactivo que nunca corta texto */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-border/90 bg-muted/20 p-6 text-center hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer w-full"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
              <Upload className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">
                Seleccionar fotografía
              </span>
              <span className="text-[11px] text-muted-foreground">
                Haz clic para subir desde tu dispositivo
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/75 font-mono">
              JPEG, PNG, WebP o GIF (Máx. 5 MB)
            </span>
          </button>
        </div>
      )}

      {localError ? (
        <p className="text-xs font-medium text-destructive pt-1">{localError}</p>
      ) : null}
    </Field>
  )
}
