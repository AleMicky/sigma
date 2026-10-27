import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import { useRegistrarBitacoraMutation } from "../api/salida-vehicular.mutations"
import type { SalidaVehicular } from "../api/salida-vehicular.types"

interface RegistrarBitacoraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salida: SalidaVehicular | null
}

type TipoBitacora = "ACTIVIDAD" | "NOVEDAD" | "INCIDENTE"
type GpsStatus = "idle" | "locating" | "success" | "error" | "unsupported"

const TIPOS: {
  value: TipoBitacora
  label: string
  desc: string
  color: string
}[] = [
  {
    value: "ACTIVIDAD",
    label: "Actividad Regular",
    desc: "Parada operativa, carga de combustible, relevo o escala",
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    value: "NOVEDAD",
    label: "Novedad en Ruta",
    desc: "Desvío, congestión, clima adverso o cambio menor",
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    value: "INCIDENTE",
    label: "Incidente / Falla",
    desc: "Avería mecánica, pinchazo, siniestro o urgencia",
    color: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
]

export function RegistrarBitacoraModal({
  open,
  onOpenChange,
  salida,
}: RegistrarBitacoraModalProps) {
  const [tipo, setTipo] = useState<TipoBitacora>("NOVEDAD")
  const [descripcion, setDescripcion] = useState("")
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle")

  const bitacoraMutation = useRegistrarBitacoraMutation()

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDescripcion("")
      setTipo("NOVEDAD")
      setLatitud(null)
      setLongitud(null)
      setGpsStatus("idle")
    }
    onOpenChange(nextOpen)
  }

  const captureGPSManual = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("unsupported")
      return
    }

    setGpsStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(Number(pos.coords.latitude.toFixed(6)))
        setLongitud(Number(pos.coords.longitude.toFixed(6)))
        setGpsStatus("success")
      },
      () => {
        setGpsStatus("error")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  // Capturar GPS automáticamente al abrir
  useEffect(() => {
    if (!open || !salida) return
    if (typeof window === "undefined" || !navigator.geolocation) {
      return
    }

    let cancelled = false

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return
        setLatitud(Number(pos.coords.latitude.toFixed(6)))
        setLongitud(Number(pos.coords.longitude.toFixed(6)))
        setGpsStatus("success")
      },
      () => {
        if (cancelled) return
        setGpsStatus("error")
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )

    return () => {
      cancelled = true
    }
  }, [open, salida])

  const activeGpsStatus: GpsStatus = useMemo(() => {
    if (!open || !salida) return "idle"
    if (gpsStatus !== "idle") return gpsStatus
    if (typeof window !== "undefined" && !navigator.geolocation) return "unsupported"
    return "locating"
  }, [open, salida, gpsStatus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!salida || !descripcion.trim()) return

    await bitacoraMutation.mutateAsync({
      id: salida.id,
      data: {
        tipo,
        descripcion: descripcion.trim(),
        fechaHora: new Date().toISOString(),
        latitud: latitud ?? undefined,
        longitud: longitud ?? undefined,
      },
    })

    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0 rounded-2xl shadow-2xl">
        <div className="border-b bg-gradient-to-br from-card via-card to-muted/40 p-5 sm:p-6 pb-4">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shadow-2xs shrink-0">
                <FileText className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  Registrar Entrada en Bitácora
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Salida #{salida?.numero} &bull; {salida?.placa ?? salida?.activoDescripcion}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Selector de Tipo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Tipo de Registro
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TIPOS.map((t) => {
                const isSelected = tipo === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={cn(
                      "text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col justify-between gap-1 shadow-2xs",
                      isSelected
                        ? cn(t.color, "ring-2 ring-primary/40 font-semibold shadow-xs")
                        : "border-border/70 hover:border-border bg-card/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="font-bold">{t.label}</span>
                    <span className="text-[10.5px] leading-tight opacity-80">
                      {t.desc}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="bitacora-desc" className="text-xs font-semibold text-foreground">
              Descripción o Detalle del Suceso <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="bitacora-desc"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Indique detalladamente lo acontecido en ruta..."
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Geolocalización GPS status */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Compass className="size-3.5 text-primary" />
                Geolocalización GPS
              </span>

              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={captureGPSManual}
                disabled={activeGpsStatus === "locating"}
                className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
              >
                <RefreshCw
                  className={cn("size-2.5", activeGpsStatus === "locating" && "animate-spin")}
                />
                Reintentar
              </Button>
            </div>

            {activeGpsStatus === "locating" && (
              <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                <Loader2 className="size-3 animate-spin text-primary" />
                <span>Capturando coordenadas actuales desde el dispositivo...</span>
              </div>
            )}

            {activeGpsStatus === "success" && latitud != null && longitud != null && (
              <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" />
                  {latitud.toFixed(5)}, {longitud.toFixed(5)}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                >
                  GPS Preciso
                </Badge>
              </div>
            )}

            {activeGpsStatus === "error" && (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-3 shrink-0" />
                <span>No se pudo obtener la ubicación GPS (permiso denegado o tiempo agotado).</span>
              </div>
            )}

            {activeGpsStatus === "unsupported" && (
              <p className="text-[11px] text-muted-foreground">
                Geolocalización no soportada por el navegador.
              </p>
            )}
          </div>

          <DialogFooter className="pt-2 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={bitacoraMutation.isPending}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={bitacoraMutation.isPending || !descripcion.trim()}
              className="text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {bitacoraMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Registro"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
