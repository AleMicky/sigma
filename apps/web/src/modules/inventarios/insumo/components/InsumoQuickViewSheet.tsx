import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Edit2,
  FolderTree,
  Package,
  Ruler,
  SlidersHorizontal,
  Tags,
} from "lucide-react"

import type { CategoriaInsumo } from "@/modules/inventarios/categoria-insumo/api/categoria-insumo.service"
import { insumoAtributoValorQueries } from "@/modules/inventarios/insumo-atributo-valor/api/insumo-atributo-valor.queries"
import { tipoInsumoAtributoQueries } from "@/modules/inventarios/tipo-insumo-atributo/api/tipo-insumo-atributo.queries"
import type { TipoInsumo } from "@/modules/inventarios/tipo-insumo/api/tipo-insumo.service"
import type { UnidadMedida } from "@/modules/parametros/unidad-medida/api/unidad-medida.service"
import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"

import type { Insumo } from "../api/insumo.service"

type InsumoQuickViewSheetProps = {
  insumo: Insumo | null
  tipoInsumo?: TipoInsumo
  categoria?: CategoriaInsumo
  unidadMedida?: UnidadMedida
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (insumo: Insumo) => void
}

export function InsumoQuickViewSheet({
  insumo,
  tipoInsumo,
  categoria,
  unidadMedida,
  open,
  onOpenChange,
  onEdit,
}: InsumoQuickViewSheetProps) {
  const valoresQuery = useQuery({
    ...insumoAtributoValorQueries.list({
      insumoId: insumo?.id,
      page: 0,
      size: 100,
    }),
    enabled: Boolean(insumo?.id) && open,
  })

  const atributosQuery = useQuery({
    ...tipoInsumoAtributoQueries.list({
      tipoInsumoId: insumo?.tipoInsumoId,
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
    enabled: Boolean(insumo?.tipoInsumoId) && open,
  })

  const valoresMap = useMemo(() => {
    const map = new Map<string, string>()
    valoresQuery.data?.content?.forEach((v) => {
      map.set(v.tipoInsumoAtributoId, v.valor)
    })
    return map
  }, [valoresQuery.data])

  const atributos = atributosQuery.data?.content ?? []

  if (!insumo) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col justify-between"
      >
        <div className="flex flex-col overflow-y-auto">
          {/* Sheet Header */}
          <SheetHeader className="p-6 border-b border-border/60 bg-muted/10 gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="size-5" />
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(insumo)
                }}
                className="gap-1.5 rounded-lg text-xs"
              >
                <Edit2 className="size-3.5" />
                Editar Insumo
              </Button>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl font-bold text-foreground">
                  {insumo.nombre}
                </SheetTitle>
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {insumo.codigo}
                </code>
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                {insumo.descripcion || "Sin descripción registrada."}
              </SheetDescription>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {tipoInsumo && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  <Tags className="size-3" />
                  {tipoInsumo.nombre}
                </span>
              )}
              {categoria && (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <FolderTree className="size-3" />
                  {categoria.nombre}
                </span>
              )}
              {unidadMedida && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                  <Ruler className="size-3" />
                  {unidadMedida.nombre} ({unidadMedida.simbolo ?? unidadMedida.codigo})
                </span>
              )}
            </div>
          </SheetHeader>

          {/* Body Content */}
          <div className="p-6 flex flex-col gap-6">
            {/* General Info */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="size-3.5" />
                Información General
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <p className="text-muted-foreground">Marca</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {insumo.marca || "No especificada"}
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <p className="text-muted-foreground">Unidad de Medida</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {unidadMedida?.nombre ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Attributes */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="size-3.5" />
                Especificaciones y Atributos Técnicos
              </h4>

              {atributos.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 italic p-3 rounded-xl border border-dashed border-border text-center">
                  Este tipo de insumo no tiene atributos dinámicos configurados.
                </p>
              ) : (
                <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
                  <dl className="divide-y divide-border/40 text-xs">
                    {atributos.map((attr) => {
                      const valor = valoresMap.get(attr.id)
                      return (
                        <div
                          key={attr.id}
                          className="flex items-center justify-between p-3"
                        >
                          <dt className="text-muted-foreground font-medium">
                            {attr.nombre}
                          </dt>
                          <dd className="font-semibold text-foreground text-right">
                            {valor ? valor : <span className="text-muted-foreground/40 italic">No especificado</span>}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              )}
            </div>

            {/* Audit Info */}
            <div className="flex flex-col gap-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Registro y Auditoría
              </h4>
              <AuditInfo data={insumo} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
