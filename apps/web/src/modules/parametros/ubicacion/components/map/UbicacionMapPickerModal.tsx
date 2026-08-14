import { useState } from "react"
import { Check, MapPin } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import type { TipoUbicacion } from "../../api/ubicacion.service"
import { UbicacionMapPicker } from "./UbicacionMapPicker"

type UbicacionMapPickerModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialLat: number | null
  initialLng: number | null
  tipo: TipoUbicacion
  direccion?: string
  onConfirmCoords: (lat: number, lng: number) => void
}

export function UbicacionMapPickerModal({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  tipo,
  direccion = "",
  onConfirmCoords,
}: UbicacionMapPickerModalProps) {
  const [tempLat, setTempLat] = useState<number | null>(initialLat)
  const [tempLng, setTempLng] = useState<number | null>(initialLng)

  function handleConfirm() {
    if (tempLat !== null && tempLng !== null) {
      onConfirmCoords(tempLat, tempLng)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] h-[85vh] p-5 flex flex-col justify-between overflow-hidden">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="size-5 text-primary" />
            <span>Seleccionar Coordenadas Geográficas</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Busca un lugar o dirección, usa tu ubicación GPS actual o haz clic en el mapa.
          </DialogDescription>
        </DialogHeader>

        {/* Map Container */}
        <div className="py-3 flex-1 min-h-0 flex flex-col min-w-0 overflow-hidden">
          <UbicacionMapPicker
            latitud={tempLat}
            longitud={tempLng}
            tipo={tipo}
            direccion={direccion}
            onChangeCoords={(lat, lng) => {
              setTempLat(lat)
              setTempLng(lng)
            }}
          />
        </div>

        {/* Footer Actions & Coordinate Preview */}
        <DialogFooter className="pt-3 border-t flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            {tempLat !== null && tempLng !== null ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono font-semibold text-primary">
                <MapPin className="size-3.5" />
                <span>{tempLat}, {tempLng}</span>
              </span>
            ) : (
              <span className="italic text-muted-foreground">
                Haz clic en el mapa para fijar una ubicación
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={tempLat === null || tempLng === null}
              className="gap-1.5"
            >
              <Check className="size-4" />
              Confirmar Coordenadas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
