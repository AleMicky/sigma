import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Layers, Loader2, Minus, Plus, Tag } from "lucide-react"

import { accesorioQueries } from "@/modules/activos/accesorio/api/accesorio.queries"
import {
  useCreateActivoAccesorio,
  useUpdateActivoAccesorio,
} from "@/modules/activos/activo-accesorio/api/activo-accesorio.mutations"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
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

type ActivoAccesorioFormModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activoId: string
  activoCodigo?: string
  activoNombre?: string
  categoriaId?: string
  itemToEdit?: ActivoAccesorio | null
}

export function ActivoAccesorioFormModal({
  open,
  onOpenChange,
  activoId,
  activoCodigo,
  activoNombre,
  categoriaId,
  itemToEdit,
}: ActivoAccesorioFormModalProps) {
  const isEditing = Boolean(itemToEdit)
  const createMutation = useCreateActivoAccesorio()
  const updateMutation = useUpdateActivoAccesorio()

  const [accesorioId, setAccesorioId] = useState("")
  const [cantidad, setCantidad] = useState(1)
  const [numeroSerie, setNumeroSerie] = useState("")
  const [observacion, setObservacion] = useState("")


  // Fetch accessories
  const accesoriosQuery = useQuery({
    ...accesorioQueries.list({
      categoriaId: categoriaId || undefined,
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
    enabled: open,
  })
  const accesorios = accesoriosQuery.data?.content ?? []

  // Ensure itemToEdit is present in the list when editing
  const accesoriosList = useMemo(() => {
    const list = [...accesorios]
    if (
      itemToEdit?.accesorio &&
      !list.some((acc) => acc.id === itemToEdit.accesorio?.id)
    ) {
      list.unshift({
        id: itemToEdit.accesorio.id,
        codigo: itemToEdit.accesorio.codigo,
        nombre: itemToEdit.accesorio.nombre,
        descripcion: null,
      })
    }
    return list
  }, [accesorios, itemToEdit])

  // Prefill when editing or opening
  useEffect(() => {
    if (open) {
      if (itemToEdit) {
        setAccesorioId(itemToEdit.accesorio?.id ?? "")
        setCantidad(itemToEdit.cantidad || 1)
        setNumeroSerie(itemToEdit.numeroSerie ?? "")
        setObservacion(itemToEdit.observacion ?? "")
      } else {
        setAccesorioId("")
        setCantidad(1)
        setNumeroSerie("")
        setObservacion("")
      }
    }
  }, [open, itemToEdit])

  const isPending = createMutation.isPending || updateMutation.isPending

  function handleClose(isOpen: boolean) {
    if (!isOpen && !isPending) {
      onOpenChange(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accesorioId || cantidad < 1) return

    try {
      if (isEditing && itemToEdit) {
        await updateMutation.mutateAsync({
          id: itemToEdit.id,
          payload: {
            activoId,
            accesorioId,
            cantidad,
            numeroSerie: numeroSerie.trim() || undefined,
            observacion: observacion.trim() || undefined,
          },
        })
      } else {
        await createMutation.mutateAsync({
          activoId,
          accesorioId,
          cantidad,
          numeroSerie: numeroSerie.trim() || undefined,
          observacion: observacion.trim() || undefined,
        })
      }
      onOpenChange(false)
    } catch {
      // Handled by mutation toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  {isEditing
                    ? "Editar Accesorio Asignado"
                    : "Asignar Accesorio al Activo"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {activoCodigo ? (
                    <span>
                      Activo: <strong className="text-foreground">{activoCodigo}</strong>
                      {activoNombre ? ` - ${activoNombre}` : ""}
                    </span>
                  ) : (
                    "Vincula un accesorio o periférico a este activo."
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-3.5 py-1">
            {/* Accesorio selection */}
            <div className="space-y-1.5">
              <Label htmlFor="accesorio" className="text-xs font-semibold">
                Accesorio <span className="text-destructive">*</span>
              </Label>

              <Select
                value={accesorioId}
                onValueChange={(val) => setAccesorioId(val ?? "")}
                disabled={isPending || isEditing || accesoriosQuery.isLoading}
              >
                <SelectTrigger id="accesorio" className="h-9 text-xs w-full">
                  <SelectValue
                    placeholder={
                      accesoriosQuery.isLoading
                        ? "Cargando accesorios..."
                        : "Seleccione un accesorio..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {accesoriosList.map((acc) => {
                    const matchesCategory =
                      categoriaId && acc.catalogo?.id === categoriaId
                    return (
                      <SelectItem
                        key={acc.id}
                        value={acc.id}
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="size-3 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {acc.codigo}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span>{acc.nombre}</span>
                          {matchesCategory && (
                            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              Recomendado
                            </span>
                          )}
                          {acc.catalogo?.nombre && !matchesCategory && (
                            <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {acc.catalogo.nombre}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}

                  {accesoriosList.length === 0 && !accesoriosQuery.isLoading && (
                    <div className="py-3 text-center text-xs text-muted-foreground">
                      No hay accesorios registrados en el sistema.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Cantidad Stepper */}
            <div className="space-y-1.5">
              <Label htmlFor="cantidad" className="text-xs font-semibold">
                Cantidad <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-input bg-background shadow-xs">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8.5 rounded-r-none hover:bg-muted"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    disabled={cantidad <= 1 || isPending}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <Input
                    id="cantidad"
                    type="number"
                    min={1}
                    value={cantidad}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      setCantidad(isNaN(val) || val < 1 ? 1 : val)
                    }}
                    disabled={isPending}
                    className="h-8.5 w-16 border-0 text-center text-xs font-semibold focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8.5 rounded-l-none hover:bg-muted"
                    onClick={() => setCantidad((prev) => prev + 1)}
                    disabled={isPending}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Unidades físicas asignadas
                </span>
              </div>
            </div>

            {/* Número de Serie */}
            <div className="space-y-1.5">
              <Label htmlFor="numeroSerie" className="text-xs font-semibold">
                Número de Serie{" "}
                <span className="font-normal text-muted-foreground">
                  (Opcional)
                </span>
              </Label>
              <Input
                id="numeroSerie"
                placeholder="Ej. SN-892344-A"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                maxLength={100}
                disabled={isPending}
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador de serie o placa propia del accesorio si aplica.
              </p>
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5">
              <Label htmlFor="observacion" className="text-xs font-semibold">
                Observación / Estado{" "}
                <span className="font-normal text-muted-foreground">
                  (Opcional)
                </span>
              </Label>
              <Textarea
                id="observacion"
                placeholder="Detalles sobre el estado, ubicación de montaje o notas relevantes..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={2}
                maxLength={500}
                disabled={isPending}
                className="resize-none text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!accesorioId || cantidad < 1 || isPending}
              className="text-xs"
            >
              {isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              {isEditing ? "Guardar Cambios" : "Asignar Accesorio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
