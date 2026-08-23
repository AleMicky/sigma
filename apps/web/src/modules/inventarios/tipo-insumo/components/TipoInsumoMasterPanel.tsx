import { useState } from "react"
import {
  Boxes,
  Check,
  Copy,
  Cpu,
  Droplet,
  FolderOpen,
  Package,
  Shield,
  Tags,
  Wrench,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteTipoInsumo } from "../api/tipo-insumo.mutations"
import type { TipoInsumo } from "../api/tipo-insumo.service"

type TipoInsumoMasterPanelProps = {
  tipos: TipoInsumo[]
  page?: PageResponse<TipoInsumo>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (tipo: TipoInsumo) => void
  onPageChange: (page: number) => void
}

function getTipoInsumoIcon(codigo: string, nombre: string) {
  const text = (codigo + " " + nombre).toUpperCase()
  if (text.includes("MECAN") || text.includes("REPUESTO") || text.includes("HERRAMIENTA")) {
    return Wrench
  }
  if (text.includes("ELEC") || text.includes("CIRCUITO") || text.includes("POTENCIA")) {
    return Zap
  }
  if (text.includes("DIGITAL") || text.includes("CHIP") || text.includes("COMPUTO") || text.includes("SENSOR")) {
    return Cpu
  }
  if (text.includes("QUIMIC") || text.includes("LUBRIC") || text.includes("ACEITE") || text.includes("FLUIDO")) {
    return Droplet
  }
  if (text.includes("EPP") || text.includes("SEGUR") || text.includes("PROTEC")) {
    return Shield
  }
  if (text.includes("PAQUETE") || text.includes("CAJA") || text.includes("EMPAQUE")) {
    return Boxes
  }
  if (text.includes("CONSUMIBLE") || text.includes("MATERIAL") || text.includes("SUMINISTRO")) {
    return Package
  }
  return Tags
}

export function TipoInsumoMasterPanel({
  tipos,
  page,
  selectedId,
  search,
  isLoading,
  isFetching,
  errorMessage,
  onSearchChange,
  onSelect,
  onCreate,
  onEdit,
  onPageChange,
}: TipoInsumoMasterPanelProps) {
  const deleteMutation = useDeleteTipoInsumo()
  const [tipoToDelete, setTipoToDelete] = useState<TipoInsumo | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyCode(e: React.MouseEvent, tipo: TipoInsumo) {
    e.stopPropagation()
    navigator.clipboard.writeText(tipo.codigo)
    setCopiedId(tipo.id)
    toast.success(`Código "${tipo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <MasterPanelShell
      label="Tipos"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar tipos de insumo"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(tipoToDelete)}
          onOpenChange={(open) => {
            if (!open) setTipoToDelete(null)
          }}
          title="Eliminar tipo de insumo"
          description={
            tipoToDelete
              ? `¿Seguro que deseas eliminar el tipo "${tipoToDelete.nombre}"? Sus atributos asociados también se verán afectados.`
              : "¿Seguro que deseas eliminar este tipo de insumo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!tipoToDelete) return
            await deleteMutation.mutateAsync(tipoToDelete.id)
            setTipoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={tipos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(tipo) => tipo.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay tipos de insumo",
          description:
            "Crea un tipo de insumo para clasificar y configurar especificaciones técnicas dinámicas.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(tipo) => {
          const Icon = getTipoInsumoIcon(tipo.codigo, tipo.nombre)
          const isSelected = tipo.id === selectedId
          const isCopied = copiedId === tipo.id

          return (
            <SelectableListItem
              active={isSelected}
              onSelect={() => onSelect(tipo.id)}
              title={
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span className="truncate">{tipo.nombre}</span>
                </div>
              }
              subtitle={
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="w-fit max-w-[180px] truncate rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:bg-muted">
                    {tipo.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, tipo)}
                    className="inline-flex size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
                    title="Copiar código"
                  >
                    {isCopied ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              }
              actions={
                <RowActions
                  editLabel="Editar tipo de insumo"
                  deleteLabel="Eliminar tipo de insumo"
                  deleteDisabled={deleteMutation.isPending}
                  onEdit={() => onEdit(tipo)}
                  onDelete={() => setTipoToDelete(tipo)}
                />
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}
