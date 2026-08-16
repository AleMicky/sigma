import { useState } from "react"
import { Wrench } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

import type { MantenimientoItem } from "../types"

type ActivoAddMantenimientoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoCodigo: string
  onAddMantenimiento: (mantenimiento: MantenimientoItem) => void
}

export function ActivoAddMantenimientoModal({
  open,
  onOpenChange,
  activoCodigo,
  onAddMantenimiento,
}: ActivoAddMantenimientoModalProps) {
  const [newMaintType, setNewMaintType] = useState<
    "preventivo" | "correctivo"
  >("preventivo")
  const [newMaintTitle, setNewMaintTitle] = useState("")
  const [newMaintKm, setNewMaintKm] = useState("")
  const [newMaintResp, setNewMaintResp] = useState("")
  const [newMaintObs, setNewMaintObs] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newMaintTitle.trim()) {
      toast.error("Por favor describe el mantenimiento realizado")
      return
    }

    const newMaint: MantenimientoItem = {
      id: `maint-${Date.now()}`,
      tipo: newMaintType,
      titulo: newMaintTitle.trim(),
      fecha: new Date().toLocaleDateString("es-ES"),
      kilometraje: newMaintKm.trim() || undefined,
      responsable: newMaintResp.trim() || "Taller Mecánico Central",
      observaciones:
        newMaintObs.trim() ||
        "Mantenimiento completado satisfactoriamente.",
    }

    onAddMantenimiento(newMaint)
    onOpenChange(false)
    setNewMaintTitle("")
    setNewMaintKm("")
    setNewMaintResp("")
    setNewMaintObs("")
    toast.success("Registro de mantenimiento guardado exitosamente")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-4.5 text-primary" />
            Registrar Mantenimiento
          </DialogTitle>
          <DialogDescription>
            Registra un servicio preventivo, correctivo o inspección técnica para el activo{" "}
            {activoCodigo}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-2 text-xs">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Tipo de Mantenimiento</Label>
            <Select
              value={newMaintType}
              onValueChange={(val) =>
                setNewMaintType(val as "preventivo" | "correctivo")
              }
            >
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preventivo">
                  Mantenimiento Preventivo
                </SelectItem>
                <SelectItem value="correctivo">
                  Mantenimiento Correctivo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Título / Descripción corta</Label>
            <Input
              value={newMaintTitle}
              onChange={(e) => setNewMaintTitle(e.target.value)}
              placeholder="Ej. Cambio de filtros y aceite motor"
              className="h-8.5 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Kilometraje / Horas</Label>
              <Input
                value={newMaintKm}
                onChange={(e) => setNewMaintKm(e.target.value)}
                placeholder="Ej. 45,230 km"
                className="h-8.5 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Taller / Responsable</Label>
              <Input
                value={newMaintResp}
                onChange={(e) => setNewMaintResp(e.target.value)}
                placeholder="Ej. Taller Mecánico Central"
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Detalle / Observaciones técnicas</Label>
            <Textarea
              value={newMaintObs}
              onChange={(e) => setNewMaintObs(e.target.value)}
              placeholder="Detalla los trabajos y repuestos utilizados..."
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Guardar Registro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
