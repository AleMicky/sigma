import {
  Download,
  Eye,
  FileSearch,
  FileText,
  Plus,
  Search,
} from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/shared/components/empty-state"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import type { DocumentoItem } from "../types"

type ActivoDocumentosTabProps = {
  documentos: DocumentoItem[]
  docSearch: string
  onSearchChange: (value: string) => void
  docFilter: string
  onFilterChange: (value: string) => void
  onOpenAddDocument: () => void
}

export function ActivoDocumentosTab({
  documentos,
  docSearch,
  onSearchChange,
  docFilter,
  onFilterChange,
  onOpenAddDocument,
}: ActivoDocumentosTabProps) {
  const filteredDocumentos = documentos.filter((doc) => {
    const matchSearch =
      doc.titulo.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.codigoRef.toLowerCase().includes(docSearch.toLowerCase()) ||
      doc.tipo.toLowerCase().includes(docSearch.toLowerCase())

    if (!matchSearch) return false

    if (docFilter === "todos") return true
    return doc.estado === docFilter
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Header / Filter Toolbar for Documents */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={docSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar documento por título o código..."
              className="h-8.5 pl-8 text-xs"
            />
          </div>

          <Select value={docFilter} onValueChange={(val) => onFilterChange(val ?? "todos")}>
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
          description="No se encontraron documentos con los filtros seleccionados."
          action={
            <Button size="sm" onClick={onOpenAddDocument}>
              <Plus className="size-4" />
              Registrar Primer Documento
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocumentos.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-border/80 bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {doc.titulo}
                    </h4>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {doc.codigoRef}
                    </span>
                  </div>
                </div>

                {doc.estado === "vigente" ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    Vigente
                  </span>
                ) : doc.estado === "por_vencer" ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    Por vencer
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-destructive/15 text-destructive border border-destructive/25">
                    Vencido
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-border/50 bg-muted/20 -mx-4 px-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Emisión
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {doc.fechaEmision}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Vencimiento
                  </span>
                  <span className="font-medium text-foreground text-xs">
                    {doc.fechaVencimiento}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground">
                  {doc.tamano}
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => toast.info(`Visualizando: ${doc.titulo}`)}
                    title="Ver archivo"
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => toast.success(`Descargando: ${doc.titulo}`)}
                    title="Descargar"
                  >
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
