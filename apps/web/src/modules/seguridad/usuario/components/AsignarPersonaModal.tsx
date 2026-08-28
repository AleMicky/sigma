import { useEffect, useState } from "react"
import { IdCard, Loader2, UserCheck, X } from "lucide-react"

import { PersonaCombobox } from "@/modules/organizacion/persona/components/PersonaCombobox"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import { useActualizarPersonaUsuario } from "../api/usuario.mutations"
import type { Usuario } from "../api/usuario.service"

type AsignarPersonaModalProps = {
  usuario: Usuario | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AsignarPersonaModal({
  usuario,
  open,
  onOpenChange,
}: AsignarPersonaModalProps) {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("")
  const mutation = useActualizarPersonaUsuario()

  useEffect(() => {
    if (usuario && open) {
      setSelectedPersonaId(usuario.personaId ?? "")
    }
  }, [usuario, open])

  if (!usuario) return null

  const isPending = mutation.isPending
  const hasChanges = (usuario.personaId ?? "") !== selectedPersonaId

  async function handleSave() {
    if (!usuario) return
    try {
      await mutation.mutateAsync({
        id: usuario.id,
        personaId: selectedPersonaId || null,
      })
      onOpenChange(false)
    } catch {
      // Toast notification is managed by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <IdCard className="size-5" />
            <DialogTitle className="font-heading text-lg">
              Asociar Persona al Usuario
            </DialogTitle>
          </div>
          <DialogDescription>
            Vincula una persona del módulo organizacional a{" "}
            <span className="font-mono font-semibold text-foreground">
              @{usuario.username}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Usuario:</span>
              <span className="font-semibold text-foreground">
                {usuario.nombre || usuario.username}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Correo:</span>
              <span className="text-foreground">{usuario.email || "Sin correo"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-foreground">
              Persona Organizacional
            </label>
            <PersonaCombobox
              value={selectedPersonaId}
              onValueChange={setSelectedPersonaId}
              placeholder="Buscar persona por nombre o documento..."
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Cada persona solo puede estar vinculada a un único usuario del sistema.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2 pt-2">
          {selectedPersonaId ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedPersonaId("")}
              disabled={isPending}
              className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Desvincular</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isPending || !hasChanges}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UserCheck className="size-3.5" />
              )}
              <span>Guardar</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
