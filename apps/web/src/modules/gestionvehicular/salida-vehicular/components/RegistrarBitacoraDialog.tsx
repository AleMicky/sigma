import { useState } from "react"
import { Compass, FileText, Loader2, MapPin } from "lucide-react"
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

import { useRegistrarBitacoraMutation } from "../api/salida-vehicular.mutations"

interface RegistrarBitacoraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salidaId: string
  salidaNumero?: string
}

export function RegistrarBitacoraDialog({
  open,
  onOpenChange,
  salidaId,
  salidaNumero,
}: RegistrarBitacoraDialogProps) {
  const [tipo, setTipo] = useState<string>("ACTIVIDAD")
  const [descripcion, setDescripcion] = useState<string>("")
  const [latitud, setLatitud] = useState<string>("")
  const [longitud, setLongitud] = useState<string>("")
  const [isLocating, setIsLocating] = useState(false)

  const bitacoraMutation = useRegistrarBitacoraMutation()

  const handleCaptureGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada por el navegador")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude.toFixed(6))
        setLongitud(pos.coords.longitude.toFixed(6))
        setIsLocating(false)
        toast.success("Coordenadas GPS capturadas con éxito")
      },
      (err) => {
        setIsLocating(false)
        toast.error(`Error al obtener ubicación: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salidaId || !descripcion.trim()) return

    await bitacoraMutation.mutateAsync({
      id: salidaId,
      data: {
        tipo,
        descripcion: descripcion.trim(),
        latitud: latitud ? parseFloat(latitud) : undefined,
        longitud: longitud ? parseFloat(longitud) : undefined,
      },
    })

    // Reset & close
    setDescripcion("")
    setLatitud("")
    setLongitud("")
    setTipo("ACTIVIDAD")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FileText className="h-5 w-5 text-indigo-500" />
              Registrar Entrada en Bitácora
            </DialogTitle>
            <DialogDescription className="text-xs">
              Registre actividades, novedades o incidentes sucedidos durante la salida {salidaNumero ? `#${salidaNumero}` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="tipo" className="text-xs font-medium">
                Tipo de Entrada <span className="text-destructive">*</span>
              </Label>
              <Select value={tipo} onValueChange={(val) => setTipo(val ?? "ACTIVIDAD")} required>
                <SelectTrigger id="tipo" className="h-9 text-xs">
                  <SelectValue placeholder="Seleccione tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVIDAD" className="text-xs">
                    Actividad de Operación Normal
                  </SelectItem>
                  <SelectItem value="NOVEDAD" className="text-xs">
                    Novedad o Desvío de Ruta
                  </SelectItem>
                  <SelectItem value="INCIDENTE" className="text-xs text-rose-600 font-medium">
                    Incidente Mecánico / Tránsito
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-medium">
                Descripción del Evento <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="descripcion"
                rows={3}
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describa la actividad, imprevisto, repostaje de combustible o incidente..."
                className="text-xs resize-none"
              />
            </div>

            {/* GPS Coordenadas */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Ubicación GPS (Opcional)
                </Label>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  disabled={isLocating}
                  className="text-[10px] text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  {isLocating ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Compass className="h-2.5 w-2.5" />
                  )}
                  Capturar GPS
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Latitud"
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
                <Input
                  placeholder="Longitud"
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={bitacoraMutation.isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={bitacoraMutation.isPending || !descripcion.trim()}
              className="text-xs gap-1.5"
            >
              {bitacoraMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  Guardar Bitácora
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
