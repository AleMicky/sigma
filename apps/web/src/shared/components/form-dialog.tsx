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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}{" "}
            <span className="text-muted-foreground">
              Los campos con <span className="text-destructive">*</span> son
              obligatorios.
            </span>
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            {children}
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
          </FieldGroup>

          <DialogFooter>
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
