import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { Dialog, DialogContent } from "@/shared/components/ui/dialog"

type ActivoImagePreviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl?: string | null
  altText: string
}

export function ActivoImagePreviewModal({
  open,
  onOpenChange,
  imageUrl,
  altText,
}: ActivoImagePreviewModalProps) {
  if (!imageUrl) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur-md">
        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-black/20">
          <AuthenticatedImage
            src={imageUrl}
            alt={altText}
            className="size-full object-contain"
            fallback={
              <div className="size-full flex items-center justify-center text-xs text-muted-foreground">
                Sin imagen
              </div>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
