import { useState } from "react"
import {
  Activity,
  BookOpen,
  Check,
  Coins,
  Copy,
  Eye,
  FileText,
  FolderOpen,
  Tags,
} from "lucide-react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/shared/components/confirm-delete-dialog"
import {
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RowActions } from "@/shared/components/row-actions"
import { Button } from "@/shared/components/ui/button"
import type { PageResponse } from "@/shared/types/api.types"

import { useDeleteCatalogo } from "../api/catalogo.mutations"
import type { Catalogo } from "../api/catalogo.service"

type CatalogoMasterPanelProps = {
  catalogos: Catalogo[]
  page?: PageResponse<Catalogo>
  selectedId: string | null
  search: string
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
  onCreate: () => void
  onEdit: (catalogo: Catalogo) => void
  onQuickView?: (catalogo: Catalogo) => void
  onPageChange: (page: number) => void
}

function getCatalogoIcon(codigo: string, nombre: string) {
  const code = (codigo + " " + nombre).toUpperCase()
  if (code.includes("DOC") || code.includes("IDENTIFICACION")) {
    return FileText
  }
  if (code.includes("ESTADO") || code.includes("STATUS") || code.includes("EST")) {
    return Activity
  }
  if (code.includes("TIPO") || code.includes("CAT") || code.includes("GRUPO")) {
    return Tags
  }
  if (code.includes("MONEDA") || code.includes("VALOR") || code.includes("PRECIO")) {
    return Coins
  }
  return BookOpen
}

export function CatalogoMasterPanel({
  catalogos,
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
  onQuickView,
  onPageChange,
}: CatalogoMasterPanelProps) {
  const deleteMutation = useDeleteCatalogo()
  const [catalogoToDelete, setCatalogoToDelete] = useState<Catalogo | null>(
    null,
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copyCode(e: React.MouseEvent, catalogo: Catalogo) {
    e.stopPropagation()
    navigator.clipboard.writeText(catalogo.codigo)
    setCopiedId(catalogo.id)
    toast.success(`Código "${catalogo.codigo}" copiado al portapapeles`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <MasterPanelShell
      label="Maestros"
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar por código o nombre…"
      searchAriaLabel="Buscar catálogos"
      footer={
        <ConfirmDeleteDialog
          open={Boolean(catalogoToDelete)}
          onOpenChange={(open) => {
            if (!open) setCatalogoToDelete(null)
          }}
          title="Eliminar catálogo"
          description={
            catalogoToDelete
              ? `¿Seguro que deseas eliminar "${catalogoToDelete.nombre}"? También se eliminarán sus valores.`
              : "¿Seguro que deseas eliminar este catálogo?"
          }
          isPending={deleteMutation.isPending}
          onConfirm={async () => {
            if (!catalogoToDelete) return
            await deleteMutation.mutateAsync(catalogoToDelete.id)
            setCatalogoToDelete(null)
          }}
        />
      }
    >
      <PaginatedList
        items={catalogos}
        page={page}
        isLoading={isLoading}
        isFetching={isFetching}
        errorMessage={errorMessage}
        hasSearch={search.trim().length > 0}
        onPageChange={onPageChange}
        getKey={(catalogo) => catalogo.id}
        empty={{
          icon: <FolderOpen className="size-4 text-muted-foreground" />,
          title: "No hay catálogos",
          description:
            "Crea un catálogo maestro, por ejemplo Tipo de documento.",
          actionLabel: "Crear",
          onAction: onCreate,
          searchDescription: "Prueba con otro código o nombre.",
        }}
      >
        {(catalogo) => {
          const Icon = getCatalogoIcon(catalogo.codigo, catalogo.nombre)
          const isSelected = catalogo.id === selectedId
          const isCopied = copiedId === catalogo.id

          return (
            <SelectableListItem
              active={isSelected}
              onSelect={() => onSelect(catalogo.id)}
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
                  <span className="truncate">{catalogo.nombre}</span>
                </div>
              }
              subtitle={
                <div className="flex items-center gap-1.5 pt-0.5">
                  <code className="w-fit max-w-[180px] truncate rounded bg-muted/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground group-hover:bg-muted">
                    {catalogo.codigo}
                  </code>
                  <button
                    type="button"
                    onClick={(e) => copyCode(e, catalogo)}
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
                <div className="flex items-center gap-0.5">
                  {onQuickView ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onQuickView(catalogo)
                      }}
                      title="Ver ficha técnica"
                      aria-label="Ver ficha técnica"
                    >
                      <Eye className="size-3.5 text-muted-foreground" />
                    </Button>
                  ) : null}
                  <RowActions
                    editLabel="Editar catálogo"
                    deleteLabel="Eliminar catálogo"
                    deleteDisabled={deleteMutation.isPending}
                    onEdit={() => onEdit(catalogo)}
                    onDelete={() => setCatalogoToDelete(catalogo)}
                  />
                </div>
              }
            />
          )
        }}
      </PaginatedList>
    </MasterPanelShell>
  )
}
