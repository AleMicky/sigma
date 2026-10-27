import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Car, Loader2, MapPin, Navigation } from "lucide-react"

import { activoQueries } from "@/modules/activos/activo/api/activo.queries"
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

import { useRegistrarSalidaMutation } from "../api/salida-vehicular.mutations"

interface RegistrarSalidaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrarSalidaDialog({
  open,
  onOpenChange,
}: RegistrarSalidaDialogProps) {
  const [activoId, setActivoId] = useState("")
  const [origen, setOrigen] = useState("Sede Central")
  const [destino, setDestino] = useState("")
  const [motivo, setMotivo] = useState("")

  // Fetch list of vehicles/activos
  const activosQuery = useQuery(
    activoQueries.list({
      page: 0,
      size: 150,
      sortBy: "codigo",
      direction: "ASC",
    })
  )

  const activos = activosQuery.data?.content ?? []

  const registrarMutation = useRegistrarSalidaMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activoId || !origen || !destino || !motivo) return

    await registrarMutation.mutateAsync({
      activoId,
      origen,
      destino,
      motivo,
    })

    // Reset & close
    setActivoId("")
    setOrigen("Sede Central")
    setDestino("")
    setMotivo("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Car className="h-5 w-5 text-primary" />
              Registrar Nueva Salida Vehicular
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete los datos del viaje para registrar la salida e iniciar el proceso de flujo BPMN Flowable.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-xs">
            {/* Vehículo */}
            <div className="space-y-1.5">
              <Label htmlFor="vehiculo" className="text-xs font-medium">
                Vehículo Asignado <span className="text-destructive">*</span>
              </Label>
              <Select value={activoId} onValueChange={(val) => setActivoId(val ?? "")} required>
                <SelectTrigger id="vehiculo" className="h-9 text-xs">
                  <SelectValue placeholder="Seleccione un vehículo..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {activos.map((activo) => (
                    <SelectItem key={activo.id} value={activo.id} className="text-xs">
                      {activo.codigo} - {activo.nombre} {activo.descripcion ? `(${activo.descripcion})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ruta: Origen y Destino */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="origen" className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Origen <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="origen"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej. Sede Central"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="destino" className="text-xs font-medium flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                  Destino <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="destino"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ej. Campamento Norte"
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Motivo */}
            <div className="space-y-1.5">
              <Label htmlFor="motivo" className="text-xs font-medium">
                Motivo / Justificación del Viaje <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Describa el objetivo de la salida, inspección o comisión..."
                required
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={registrarMutation.isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={registrarMutation.isPending || !activoId || !origen || !destino || !motivo}
              className="text-xs gap-1.5"
            >
              {registrarMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Iniciando proceso...
                </>
              ) : (
                <>
                  <Car className="h-3.5 w-3.5" />
                  Registrar e Iniciar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
