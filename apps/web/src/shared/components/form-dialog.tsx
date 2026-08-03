import type { FormEvent, ReactNode } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { FieldGroup, FieldLabel } from "@/shared/components/ui/field"
import { cn } from "@/shared/lib/utils"

type FormDialogSize = "sm" | "md" | "lg"

const FORM_DIALOG_SIZE_CLASS: Record<FormDialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg sm:max-w-xl",
  lg: "max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
}

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  formError?: string | null
  onSubmit: () => void | Promise<void>
  onCancel?: () => void
  children: ReactNode
  /** Extra footer actions after Cancel (typically the submit button). */
  footer: ReactNode
  cancelLabel?: string
  size?: FormDialogSize
  className?: string
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  formError,
  onSubmit,
  onCancel,
  children,
  footer,
  cancelLabel = "Cancelar",
  size = "md",
  className,
}: FormDialogProps) {
  function handleOpenChange(next: boolean) {
    if (!next) {
      onCancel?.()
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    void onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(92dvh,52rem)] gap-0 overflow-hidden p-0",
          FORM_DIALOG_SIZE_CLASS[size],
          className,
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}{" "}
            <span className="text-muted-foreground">
              Los campos con <span className="text-destructive">*</span> son
              obligatorios.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
            <FieldGroup>
              {children}
              {formError ? (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
            </FieldGroup>
          </div>

          <DialogFooter className="shrink-0 border-t border-border px-4 py-3 sm:px-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            {footer}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type FormDialogSubmitProps = {
  canSubmit: boolean
  isSubmitting: boolean
  label?: string
  submittingLabel?: string
}

export function FormDialogSubmit({
  canSubmit,
  isSubmitting,
  label = "Guardar",
  submittingLabel = "Guardando…",
}: FormDialogSubmitProps) {
  return (
    <Button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? submittingLabel : label}
    </Button>
  )
}

type RequiredFieldLabelProps = {
  htmlFor: string
  children: ReactNode
}

export function RequiredFieldLabel({
  htmlFor,
  children,
}: RequiredFieldLabelProps) {
  return (
    <FieldLabel htmlFor={htmlFor}>
      {children}{" "}
      <span className="text-destructive" aria-hidden>
        *
      </span>
    </FieldLabel>
  )
}
