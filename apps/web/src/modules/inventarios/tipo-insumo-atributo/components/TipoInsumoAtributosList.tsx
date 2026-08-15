import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Asterisk, Plus, SlidersHorizontal, Trash2, Edit2 } from "lucide-react"

import { tipoDatoQueries } from "@/modules/parametros/tipo-dato/api/tipo-dato.queries"
import { getErrorMessage } from "@/shared/api"
import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Button } from "@/shared/components/ui/button"

import { useDeleteTipoInsumoAtributo } from "../api/tipo-insumo-atributo.mutations"
import { tipoInsumoAtributoQueries } from "../api/tipo-insumo-atributo.queries"
import type { TipoInsumoAtributo } from "../api/tipo-insumo-atributo.service"
import { TipoInsumoAtributoFormDialog } from "./TipoInsumoAtributoFormDialog"

type TipoInsumoAtributosListProps = {
  tipoInsumoId: string
}

export function TipoInsumoAtributosList({
  tipoInsumoId,
}: TipoInsumoAtributosListProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TipoInsumoAtributo | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteMutation = useDeleteTipoInsumoAtributo()

  const atributosQuery = useQuery(
    tipoInsumoAtributoQueries.list({
      tipoInsumoId,
      page: 0,
      size: 100,
      sortBy: "orden",
      direction: "ASC",
    }),
  )

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

  const atributos = atributosQuery.data?.content ?? []

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(attr: TipoInsumoAtributo) {
    setEditing(attr)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Atributos Dinámicos ({atributos.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Campos personalizados que se solicitarán al registrar o editar insumos de este tipo.
          </p>
        </div>

        <Button size="sm" onClick={openCreate} className="shrink-0 gap-1.5">
          <Plus className="size-4" />
          Agregar Atributo
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {atributosQuery.isLoading ? (
          <ListSkeleton rows={4} rowClassName="h-16 rounded-xl" />
        ) : atributosQuery.isError ? (
          <EmptyState
            title={getErrorMessage(atributosQuery.error)}
            className="text-destructive"
          />
        ) : atributos.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal className="size-8 text-muted-foreground/60" />}
            title="Sin atributos configurados"
            description="Este tipo de insumo no tiene atributos dinámicos asociados. Agrega atributos para capturar especificaciones técnicas personalizadas."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                Agregar Primer Atributo
              </Button>
            }
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center w-16">Orden</th>
                    <th className="px-4 py-3">Nombre del Atributo</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Tipo de Dato</th>
                    <th className="px-4 py-3 text-center">Obligatorio</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {atributos.map((attr) => {
                    const tipoDatoInfo = tiposDatoById.get(attr.tipoDatoId)
                    return (
                      <tr
                        key={attr.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 text-center font-mono font-medium text-muted-foreground">
                          {attr.orden ?? 0}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {attr.nombre}
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {attr.codigo}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                            {tipoDatoInfo?.nombre ?? "Tipo desconocido"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
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
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openEdit(attr)}
                              title="Editar atributo"
                            >
                              <Edit2 className="size-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingId(attr.id)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar atributo"
                              className="hover:text-destructive"
                            >
                              <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
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

      <TipoInsumoAtributoFormDialog
        key={editing?.id ?? "new-attr"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipoInsumoId={tipoInsumoId}
        atributo={editing}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
        title="Eliminar atributo"
        description="¿Seguro que deseas eliminar este atributo? Los valores asociados a insumos existentes también podrían verse afectados."
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (deletingId) {
            await deleteMutation.mutateAsync(deletingId)
            setDeletingId(null)
          }
        }}
      />
    </div>
  )
}
