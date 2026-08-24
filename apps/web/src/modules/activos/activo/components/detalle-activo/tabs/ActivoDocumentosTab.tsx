import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Download,
  Eye,
  FileSearch,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { useDeleteActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.mutations"
import { activoDocumentoQueries } from "@/modules/activos/activo-documento/api/activo-documento.queries"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import { tipoDocumentoQueries } from "@/modules/activos/tipo-documento/api/tipo-documento.queries"
import { fetchAuthenticatedBlob } from "@/shared/api"
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
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export function getDocumentoEstado(
  fechaVencimiento?: string | null,
): "vigente" | "por_vencer" | "vencido" {
  if (!fechaVencimiento) return "vigente"

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const parts = fechaVencimiento.split("-")
  const expiry =
    parts.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : new Date(fechaVencimiento)
  expiry.setHours(0, 0, 0, 0)

  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "vencido"
  if (diffDays <= 30) return "por_vencer"
  return "vigente"
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return "No registrada"
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

type ActivoDocumentosTabProps = {
  activoId: string
  docSearch?: string
  onSearchChange?: (value: string) => void
  docFilter?: string
  onFilterChange?: (value: string) => void
  onOpenAddDocument: () => void
  onEditDocumento?: (doc: ActivoDocumento) => void
}

export function ActivoDocumentosTab({
  activoId,
  docSearch: externalSearch,
  onSearchChange,
  docFilter: externalFilter,
  onFilterChange,
  onOpenAddDocument,
  onEditDocumento,
}: ActivoDocumentosTabProps) {
  const [internalSearch, setInternalSearch] = useState("")
  const [internalFilter, setInternalFilter] = useState("todos")
  const [docToDelete, setDocToDelete] = useState<ActivoDocumento | null>(null)
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

  const docSearch = externalSearch ?? internalSearch
  const docFilter = externalFilter ?? internalFilter
  const handleSearchChange = onSearchChange ?? setInternalSearch
  const handleFilterChange = onFilterChange ?? setInternalFilter

  const deleteMutation = useDeleteActivoDocumento()

  // Queries
  const documentosQuery = useQuery(
    activoDocumentoQueries.byActivo(activoId, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )
  const documentos = documentosQuery.data?.content ?? []

  const tiposDocumentoQuery = useQuery(
    tipoDocumentoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )
  const tiposDocumentoMap = useMemo(() => {
    const map = new Map<string, string>()
    ;(tiposDocumentoQuery.data?.content ?? []).forEach((t) => {
      map.set(t.id, t.nombre)
    })
    return map
  }, [tiposDocumentoQuery.data?.content])

  // Filtered documents
  const filteredDocumentos = useMemo(() => {
    return documentos.filter((doc) => {
      const tipoNombre = tiposDocumentoMap.get(doc.tipoDocumentoId) ?? ""
      const searchLower = docSearch.toLowerCase().trim()

      const matchSearch =
        !searchLower ||
        doc.nombre.toLowerCase().includes(searchLower) ||
        (doc.numeroDocumento &&
          doc.numeroDocumento.toLowerCase().includes(searchLower)) ||
        (doc.descripcion && doc.descripcion.toLowerCase().includes(searchLower)) ||
        tipoNombre.toLowerCase().includes(searchLower)

      if (!matchSearch) return false

      if (docFilter === "todos") return true

      const estado = getDocumentoEstado(doc.fechaVencimiento)
      return estado === docFilter
    })
  }, [documentos, docSearch, docFilter, tiposDocumentoMap])

  async function handleViewFile(doc: ActivoDocumento) {
    try {
      setLoadingDocId(doc.id)
      const blob = await fetchAuthenticatedBlob(doc.rutaArchivo)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch {
      toast.error("No se pudo cargar el archivo para visualización")
    } finally {
      setLoadingDocId(null)
    }
  }

  async function handleDownloadFile(doc: ActivoDocumento) {
    try {
      setLoadingDocId(doc.id)
      const blob = await fetchAuthenticatedBlob(doc.rutaArchivo)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = doc.nombreArchivo || `${doc.nombre}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Descargando: ${doc.nombreArchivo || doc.nombre}`)
    } catch {
      toast.error("No se pudo descargar el archivo")
    } finally {
      setLoadingDocId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!docToDelete) return
    try {
      await deleteMutation.mutateAsync(docToDelete.id)
      setDocToDelete(null)
    } catch {
      // Handled in mutation
    }
  }

  if (documentosQuery.isLoading) {
    return (
      <div className="py-4">
        <ListSkeleton rows={3} rowClassName="h-36 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header / Filter Toolbar for Documents */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={docSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar documento por título o código..."
              className="h-8.5 pl-8 text-xs"
            />
          </div>

          <Select
            value={docFilter}
            onValueChange={(val) => handleFilterChange(val ?? "todos")}
          >
            <SelectTrigger className="w-40 h-8.5 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="vigente">Vigente</SelectItem>
              <SelectItem value="por_vencer">Próximo a vencer</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          onClick={onOpenAddDocument}
          className="h-8.5 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-3.5" />
          Nuevo Documento
        </Button>
      </div>

      {/* Document Cards Grid */}
      {filteredDocumentos.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="size-8 text-muted-foreground/50" />}
          title="Sin documentos registrados"
          description={
            docSearch || docFilter !== "todos"
              ? "No se encontraron documentos con los filtros seleccionados."
              : "Este activo aún no tiene documentos o comprobantes asociados."
          }
          action={
            <Button size="sm" onClick={onOpenAddDocument}>
              <Plus className="size-4" />
              Registrar Primer Documento
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocumentos.map((doc) => {
            const estado = getDocumentoEstado(doc.fechaVencimiento)
            const tipoNombre =
              tiposDocumentoMap.get(doc.tipoDocumentoId) ?? "Documento"
            const isLoading = loadingDocId === doc.id

            return (
              <div
                key={doc.id}
                className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4
                        className="text-xs font-bold text-foreground truncate"
                        title={doc.nombre}
                      >
                        {doc.nombre}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
                        <span className="font-medium text-foreground/80">
                          {tipoNombre}
                        </span>
                        {doc.numeroDocumento && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{doc.numeroDocumento}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {estado === "vigente" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Vigente
                      </span>
                    ) : estado === "por_vencer" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                        Por vencer
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-destructive/15 text-destructive border border-destructive/25">
                        Vencido
                      </span>
                    )}
                  </div>
                </div>

                {doc.descripcion && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {doc.descripcion}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/50 bg-muted/20 -mx-4 px-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Emisión
                    </span>
                    <span className="font-medium text-foreground text-xs">
                      {formatDateString(doc.fechaEmision)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Vencimiento
                    </span>
                    <span className="font-medium text-foreground text-xs">
                      {formatDateString(doc.fechaVencimiento)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground font-mono truncate">
                    {formatFileSize(doc.size)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => handleViewFile(doc)}
                      title="Ver archivo"
                    >
                      {isLoading ? (
                        <Loader2 className="size-3.5 animate-spin text-primary" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => handleDownloadFile(doc)}
                      title="Descargar archivo"
                    >
                      <Download className="size-3.5" />
                    </Button>
                    {onEditDocumento && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => onEditDocumento(doc)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Editar documento"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => setDocToDelete(doc)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar documento"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(docToDelete)}
        onOpenChange={(open) => {
          if (!open) setDocToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar documento adjunto?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed">
              Estás a punto de eliminar el documento{" "}
              <strong className="text-foreground">{docToDelete?.nombre}</strong> y
              su archivo físico asociado. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
