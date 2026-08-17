import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  CheckCircle2,
  Copy,
  Hash,
  Layers,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { useDeleteActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.mutations"
import { activoAccesorioQueries } from "@/modules/activos/activo-accesorio/api/activo-accesorio.queries"
import type { ActivoAccesorio } from "@/modules/activos/activo-accesorio/api/activo-accesorio.service"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Input } from "@/shared/components/ui/input"

type ActivoAccesoriosTabProps = {
  activoId: string
  activoCodigo?: string
  activoNombre?: string
  tipoActivoId?: string
  onOpenAddAccesorio: () => void
  onEditAccesorio: (item: ActivoAccesorio) => void
}

export function ActivoAccesoriosTab({
  activoId,
  onOpenAddAccesorio,
  onEditAccesorio,
}: ActivoAccesoriosTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [itemToDelete, setItemToDelete] = useState<ActivoAccesorio | null>(null)

  const deleteMutation = useDeleteActivoAccesorio()

  // Query activo-accesorios for this asset
  const query = useQuery(
    activoAccesorioQueries.byActivo(activoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )

  const items = useMemo(() => query.data?.content ?? [], [query.data?.content])

  // Filter items client side with search term
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items
    const term = searchTerm.toLowerCase()
    return items.filter(
      (item) =>
        item.accesorio?.nombre?.toLowerCase().includes(term) ||
        item.accesorio?.codigo?.toLowerCase().includes(term) ||
        item.numeroSerie?.toLowerCase().includes(term) ||
        item.observacion?.toLowerCase().includes(term),
    )
  }, [items, searchTerm])

  // Stats calculation
  const totalAccesoriosAsignados = items.length
  const totalUnidades = useMemo(
    () => items.reduce((acc, curr) => acc + (curr.cantidad || 0), 0),
    [items],
  )
  const conNumeroSerie = useMemo(
    () => items.filter((i) => Boolean(i.numeroSerie?.trim())).length,
    [items],
  )

  function copySerial(serial?: string | null) {
    if (!serial) return
    void navigator.clipboard.writeText(serial)
    toast.success("Número de serie copiado al portapapeles")
  }

  async function handleDelete() {
    if (!itemToDelete) return
    try {
      await deleteMutation.mutateAsync({
        id: itemToDelete.id,
        activoId,
      })
      setItemToDelete(null)
    } catch {
      // Toast handled by mutation hook
    }
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs backdrop-blur-xs">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">
              Accesorios Asignados
            </span>
            <span className="font-heading text-lg font-bold text-foreground">
              {totalAccesoriosAsignados}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                tipos
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs backdrop-blur-xs">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Hash className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">
              Unidades Físicas Totales
            </span>
            <span className="font-heading text-lg font-bold text-foreground">
              {totalUnidades}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                unidades
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs backdrop-blur-xs">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-muted-foreground">
              Con Número de Serie
            </span>
            <span className="font-heading text-lg font-bold text-foreground">
              {conNumeroSerie}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                identificados
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/20 p-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, accesorio o serie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-border/70 bg-background p-0.5">
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded-md"
              onClick={() => setViewMode("grid")}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded-md"
              onClick={() => setViewMode("table")}
              title="Vista de tabla"
            >
              <List className="size-3.5" />
            </Button>
          </div>

          {/* Add Accessory Button */}
          <Button
            type="button"
            size="sm"
            onClick={onOpenAddAccesorio}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <Plus className="size-3.5" />
            <span>Asignar Accesorio</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {query.isLoading ? (
        <ListSkeleton
          rows={4}
          rowClassName="h-24 rounded-xl"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        />
      ) : query.isError ? (
        <EmptyState
          title="Error al cargar accesorios"
          description="Ocurrió un problema al obtener los accesorios asignados a este activo."
          className="text-destructive py-8"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Layers className="size-8 text-muted-foreground/60" />}
          title="Sin accesorios asignados"
          description="Este activo aún no tiene accesorios o periféricos vinculados (ej. GPS, Radio, Extintor, Rueda de auxilio)."
          action={
            <Button
              type="button"
              size="sm"
              onClick={onOpenAddAccesorio}
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Asignar Primer Accesorio
            </Button>
          }
          className="py-10"
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description={`No se encontraron accesorios que coincidan con "${searchTerm}".`}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-xs"
            >
              Limpiar búsqueda
            </Button>
          }
          className="py-8"
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs"
            >
              {/* Top Row: Icon, Title & Actions */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Tag className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
                          {item.accesorio?.codigo ?? "ACC"}
                        </span>
                      </div>
                      <h4 className="truncate font-heading text-sm font-semibold text-foreground">
                        {item.accesorio?.nombre ?? "Accesorio"}
                      </h4>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                        />
                      }
                    >
                      <MoreVertical className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem
                        onClick={() => onEditAccesorio(item)}
                        className="text-xs gap-2 cursor-pointer"
                      >
                        <Pencil className="size-3.5 text-muted-foreground" />
                        Editar
                      </DropdownMenuItem>
                      {item.numeroSerie && (
                        <DropdownMenuItem
                          onClick={() => copySerial(item.numeroSerie)}
                          className="text-xs gap-2 cursor-pointer"
                        >
                          <Copy className="size-3.5 text-muted-foreground" />
                          Copiar Serie
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setItemToDelete(item)}
                        className="text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        Desvincular
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges Section */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-[11px] font-semibold px-2 py-0.5"
                  >
                    Cantidad: {item.cantidad} un.
                  </Badge>

                  {item.numeroSerie ? (
                    <button
                      type="button"
                      onClick={() => copySerial(item.numeroSerie)}
                      title="Clic para copiar serie"
                      className="group/serie inline-flex items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                    >
                      <Hash className="size-3 text-muted-foreground" />
                      <span className="font-mono">{item.numeroSerie}</span>
                      <Copy className="size-2.5 text-muted-foreground opacity-0 transition-opacity group-hover/serie:opacity-100" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/70 italic">
                      Sin N° de Serie
                    </span>
                  )}
                </div>

                {/* Observation Text */}
                {item.observacion && (
                  <p className="line-clamp-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-1.5 border border-border/40">
                    {item.observacion}
                  </p>
                )}
              </div>

              {/* Bottom Footer: Date & Edit button */}
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString()
                    : "Asignado"}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditAccesorio(item)}
                  className="h-6 px-2 text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="mr-1 size-3" />
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="w-12 text-center py-2.5 px-3">
                    #
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Accesorio
                  </th>
                  <th scope="col" className="w-28 text-center py-2.5 px-3">
                    Cantidad
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Número de Serie
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Observaciones
                  </th>
                  <th scope="col" className="w-28 text-right py-2.5 px-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="text-center font-mono text-xs text-muted-foreground py-2 px-3">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Tag className="size-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-heading text-xs font-semibold text-foreground">
                            {item.accesorio?.nombre ?? "Accesorio"}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            {item.accesorio?.codigo}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-2 px-3">
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 font-bold text-xs"
                      >
                        {item.cantidad} un.
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      {item.numeroSerie ? (
                        <button
                          type="button"
                          onClick={() => copySerial(item.numeroSerie)}
                          title="Clic para copiar serie"
                          className="inline-flex items-center gap-1 font-mono text-xs text-foreground hover:underline"
                        >
                          <Hash className="size-3 text-muted-foreground" />
                          <span>{item.numeroSerie}</span>
                          <Copy className="size-2.5 text-muted-foreground" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          —
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate text-xs text-muted-foreground py-2 px-3">
                      {item.observacion || "—"}
                    </td>
                    <td className="text-right py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => onEditAccesorio(item)}
                          title="Editar"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setItemToDelete(item)}
                          title="Desvincular"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              ¿Desvincular accesorio del activo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Se eliminará la asignación de{" "}
              <strong className="text-foreground">
                {itemToDelete?.accesorio?.nombre} ({itemToDelete?.cantidad} un.)
              </strong>{" "}
              de este activo. Esta acción no elimina el accesorio del catálogo
              general.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            >
              {deleteMutation.isPending
                ? "Desvinculando..."
                : "Sí, Desvincular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
