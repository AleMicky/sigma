import { SendHorizontal } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"

import type { SolicitudMantenimiento } from "../api/solicitud.service"

type ConfirmEnviarDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  solicitud: SolicitudMantenimiento | null
  isPending?: boolean
  onConfirm: () => void | Promise<void>
}

export function ConfirmEnviarDialog({
  open,
  onOpenChange,
  solicitud,
  isPending = false,
  onConfirm,
}: ConfirmEnviarDialogProps) {
  if (!solicitud) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-primary/10 text-primary">
            <SendHorizontal />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Enviar solicitud e iniciar flujo?</AlertDialogTitle>
          <AlertDialogDescription>
            La solicitud{" "}
            <span className="font-semibold text-foreground">
              {solicitud.numero ? `[${solicitud.numero}] ` : ""}
              "{solicitud.titulo}"
            </span>{" "}
            pasará de estado <span className="font-medium uppercase text-foreground">Borrador</span> a{" "}
            <span className="font-medium uppercase text-primary">Solicitado</span> e iniciará el flujo de trabajo de mantenimiento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              void onConfirm()
            }}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <SendHorizontal className="size-3.5" />
            <span>{isPending ? "Enviando…" : "Enviar Solicitud"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
