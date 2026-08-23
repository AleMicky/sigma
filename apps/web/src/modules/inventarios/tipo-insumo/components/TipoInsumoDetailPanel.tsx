import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Asterisk,
  Check,
  Copy,
  Layers,
  ListFilter,
  Plus,
  SlidersHorizontal,
} from "lucide-react"
import { toast } from "sonner"

import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  DetailPanelHeader,
  DetailPanelShell,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { SearchField } from "@/shared/components/search-field"

import { useDeleteTipoInsumoAtributo } from "../../tipo-insumo-atributo/api/tipo-insumo-atributo.mutations"
import { tipoInsumoAtributoQueries } from "../../tipo-insumo-atributo/api/tipo-insumo-atributo.queries"
import type { TipoInsumoAtributo } from "../../tipo-insumo-atributo/api/tipo-insumo-atributo.service"
import type { TipoInsumo } from "../api/tipo-insumo.service"

type TipoInsumoDetailPanelProps = {
  tipoInsumo: TipoInsumo | null
  search: string
  hidePrimaryAction?: boolean
  onSearchChange: (value: string) => void
  onCreateAtributo: () => void
  onEditAtributo: (atributo: TipoInsumoAtributo) => void
}

function parseOptionsCount(opcionesJson?: string | null): number {
  if (!opcionesJson) return 0
  try {
    const parsed = JSON.parse(opcionesJson)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return opcionesJson.split(/[\n,]/).filter((s) => s.trim().length > 0).length
  }
}

export function TipoInsumoDetailPanel({
  tipoInsumo,
  search,
  hidePrimaryAction = false,
  onSearchChange,
  onCreateAtributo,
  onEditAtributo,
}: TipoInsumoDetailPanelProps) {
  const [atributoToDelete, setAtributoToDelete] =
    useState<TipoInsumoAtributo | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  const deleteMutation = useDeleteTipoInsumoAtributo()

  const atributosQuery = useQuery({
    ...tipoInsumoAtributoQueries.list({
      tipoInsumoId: tipoInsumo?.id ?? "",
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
      ...(search.trim() ? { q: search.trim() } : {}),
    }),
    enabled: Boolean(tipoInsumo?.id),
  })

  const tiposDatoQuery = useQuery(
    tipoDatoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposDatoById = useMemo(() => {
    const map = new Map<string, { nombre: string; codigo: string }>()
    tiposDatoQuery.data?.content?.forEach((td) => {
      map.set(td.id, { nombre: td.nombre, codigo: td.codigo })
    })
    return map
  }, [tiposDatoQuery.data])

  const rawAtributos = atributosQuery.data?.content ?? []
  const filteredAtributos = useMemo(() => {
    if (!search.trim()) return rawAtributos
    const term = search.toLowerCase()
    return rawAtributos.filter(
      (a) =>
        a.nombre.toLowerCase().includes(term) ||
        a.codigo.toLowerCase().includes(term),
    )
  }, [rawAtributos, search])

  const totalAtributos = rawAtributos.length

  function copyTipoCode() {
    if (!tipoInsumo) return
    navigator.clipboard.writeText(tipoInsumo.codigo)
    setCopiedCode(true)
    toast.success(`Código de tipo "${tipoInsumo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <DetailPanelShell
      hasSelection={Boolean(tipoInsumo)}
      emptySelectionMessage="Selecciona un tipo de insumo de la lista para configurar sus atributos dinámicos."
      header={
        tipoInsumo ? (
          <DetailPanelHeader
            title={
              <div className="flex items-center gap-2">
                <span className="truncate">{tipoInsumo.nombre}</span>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Layers className="size-3 text-muted-foreground" />
                  {totalAtributos} {totalAtributos === 1 ? "atributo" : "atributos"}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <code className="w-fit max-w-full truncate rounded bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
                    {tipoInsumo.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={copyTipoCode}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Copiar código del tipo de insumo"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-500">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copiar código</span>
                      </>
                    )}
                  </button>
                </div>
                {tipoInsumo.descripcion ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {tipoInsumo.descripcion}
                  </p>
                ) : null}
              </div>
            }
            meta={
              <div className="border-t pt-2 text-xs text-muted-foreground">
                <AuditInfo data={tipoInsumo} />
              </div>
            }
          />
        ) : null
      }
      footer={
        <ConfirmDeleteDialog
          open={Boolean(atributoToDelete)}
          onOpenChange={(open) => {
            if (!open) setAtributoToDelete(null)
          }}
          title="Eliminar atributo dinámico"
          description={
            atributoToDelete
              ? `¿Seguro que deseas eliminar el atributo "${atributoToDelete.nombre}"? Los valores capturados previamente en inventarios existentes podrían perderse.`
              : "¿Seguro que deseas eliminar este atributo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!atributoToDelete) return
            await deleteMutation.mutateAsync(atributoToDelete.id)
            setAtributoToDelete(null)
          }}
        />
      }
    >
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
        {/* Toolbar de búsqueda y acción */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 bg-muted/10">
          <div className="min-w-0 flex-1 max-w-sm">
            <SearchField
              value={search}
              onChange={onSearchChange}
              placeholder="Buscar atributo por nombre o código…"
              aria-label="Buscar atributo dinámico"
              className="h-8 text-xs"
            />
          </div>

          {!hidePrimaryAction ? (
            <Button
              size="sm"
              type="button"
              onClick={onCreateAtributo}
              className="shrink-0 gap-1 text-xs h-8 shadow-xs"
            >
              <Plus className="size-3.5" />
              <span>Agregar Atributo</span>
            </Button>
          ) : null}
        </div>

        {/* Contenido de la lista / tabla */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          {atributosQuery.isLoading ? (
            <ListSkeleton rows={4} rowClassName="h-14 rounded-xl" />
          ) : atributosQuery.isError ? (
            <EmptyState
              title={getErrorMessage(atributosQuery.error)}
              className="text-destructive"
            />
          ) : filteredAtributos.length === 0 ? (
            <EmptyState
              icon={<SlidersHorizontal className="size-8 text-muted-foreground/60" />}
              title={
                search.trim()
                  ? "Sin atributos coincidentes"
                  : "Sin atributos dinámicos configurados"
              }
              description={
                search.trim()
                  ? "Prueba con otros términos de búsqueda para encontrar atributos de este tipo."
                  : "Define especificaciones personalizadas (ej. Calibre, Voltaje, Viscosidad) para los insumos de este tipo."
              }
              action={
                search.trim() ? undefined : (
                  <Button size="sm" onClick={onCreateAtributo} className="gap-1.5">
                    <Plus className="size-4" />
                    Agregar Primer Atributo
                  </Button>
                )
              }
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-3.5 py-2.5 text-center w-14">#</th>
                      <th className="px-3.5 py-2.5">Atributo</th>
                      <th className="px-3.5 py-2.5">Código</th>
                      <th className="px-3.5 py-2.5">Tipo de Dato</th>
                      <th className="px-3.5 py-2.5 text-center">Obligatorio</th>
                      <th className="px-3.5 py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredAtributos.map((attr) => {
                      const tipoDatoInfo = tiposDatoById.get(attr.tipoDatoId)
                      const optCount = parseOptionsCount(attr.opciones)

                      return (
                        <tr
                          key={attr.id}
                          className="group transition-colors hover:bg-muted/30"
                        >
                          <td className="px-3.5 py-3 text-center font-mono font-medium text-muted-foreground">
                            {attr.orden ?? 0}
                          </td>
                          <td className="px-3.5 py-3 font-medium text-foreground">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {attr.nombre}
                              </span>
                              {optCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
                                  <ListFilter className="size-3 text-primary" />
                                  {optCount} {optCount === 1 ? "opción" : "opciones"}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3.5 py-3">
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              {attr.codigo}
                            </code>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                              {tipoDatoInfo?.nombre ?? "Tipo dato"}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center">
                            {attr.requerido ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                                <Asterisk className="size-2.5" />
                                Requerido
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Opcional
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 text-right">
                            <RowActions
                              editLabel="Editar atributo"
                              deleteLabel="Eliminar atributo"
                              deleteDisabled={deleteMutation.isPending}
                              onEdit={() => onEditAtributo(attr)}
                              onDelete={() => setAtributoToDelete(attr)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DetailPanelShell>
  )
}
