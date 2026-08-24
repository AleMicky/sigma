import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  Loader2,
  MapPin,
  Printer,
  RotateCcw,
  ShieldAlert,
  Tag,
} from "lucide-react"
import { toast } from "sonner"

import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { tipoDocumentoQueries } from "@/modules/activos/tipo-documento/api/tipo-documento.queries"
import type { TipoDocumento } from "@/modules/activos/tipo-documento/api/tipo-documento.service"
import { activoDocumentoQueries } from "@/modules/activos/activo-documento/api/activo-documento.queries"
import type { ActivoDocumento } from "@/modules/activos/activo-documento/api/activo-documento.service"
import { fetchAuthenticatedBlob, getErrorMessage } from "@/shared/api"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import {
  DetailPanelShell,
  MasterDetailLayout,
  MasterPanelShell,
  PaginatedList,
  SelectableListItem,
} from "@/shared/components/master-detail"
import { RefreshButton } from "@/shared/components/refresh-button"
import { SearchField } from "@/shared/components/search-field"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useMasterDetail } from "@/shared/hooks/use-master-detail"
import {
  useClampPage,
  usePaginatedSearch,
} from "@/shared/hooks/use-paginated-search"
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"
import type { Activo } from "../api/activo.service"

const PAGE_SIZE = 12
const ALL_FILTER = "__all__"

function getDocumentoEstado(
  fechaVencimiento?: string | null,
): "vigente" | "por_vencer" | "vencido" | "permanente" {
  if (!fechaVencimiento) return "permanente"

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

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatDateString(dateStr?: string | null): string {
  if (!dateStr) return "Sin fecha"
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

function getFileIcon(nombreArchivo: string, mimeType?: string | null) {
  const ext = nombreArchivo.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf" || mimeType?.includes("pdf")) {
    return <FileText className="size-4 text-rose-500 shrink-0" />
  }
  if (["jpg", "jpeg", "png", "webp"].includes(ext) || mimeType?.includes("image")) {
    return <ImageIcon className="size-4 text-blue-500 shrink-0" />
  }
  if (["xls", "xlsx", "csv"].includes(ext) || mimeType?.includes("sheet") || mimeType?.includes("excel")) {
    return <FileSpreadsheet className="size-4 text-emerald-500 shrink-0" />
  }
  return <FileCheck className="size-4 text-muted-foreground shrink-0" />
}

type ActivoDetailReportProps = {
  activo: Activo
  tiposDocumentoMap: Map<string, TipoDocumento>
  tiposDoc: TipoDocumento[]
}

function ActivoDetailReport({
  activo,
  tiposDocumentoMap,
  tiposDoc,
}: ActivoDetailReportProps) {
  const [docSearch, setDocSearch] = useState("")
  const [tipoDocFilter, setTipoDocFilter] = useState(ALL_FILTER)
  const [estadoFilter, setEstadoFilter] = useState(ALL_FILTER)
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

  const query = useQuery(
    activoDocumentoQueries.byActivo(activo.id, {
      size: 100,
      sortBy: "createdAt",
      direction: "DESC",
    }),
  )

  const documentos = useMemo(() => query.data?.content ?? [], [query.data?.content])

  // Summary counts
  const stats = useMemo(() => {
    let vigentes = 0
    let porVencer = 0
    let vencidos = 0
    let permanentes = 0

    documentos.forEach((doc) => {
      const estado = getDocumentoEstado(doc.fechaVencimiento)
      if (estado === "vigente") vigentes++
      else if (estado === "por_vencer") porVencer++
      else if (estado === "vencido") vencidos++
      else permanentes++
    })

    return {
      total: documentos.length,
      vigentes,
      porVencer,
      vencidos,
      permanentes,
    }
  }, [documentos])

  // Filtered list
  const filteredDocumentos = useMemo(() => {
    return documentos.filter((doc) => {
      if (tipoDocFilter !== ALL_FILTER && doc.tipoDocumentoId !== tipoDocFilter) {
        return false
      }

      const estado = getDocumentoEstado(doc.fechaVencimiento)
      if (estadoFilter !== ALL_FILTER && estado !== estadoFilter) {
        return false
      }

      if (docSearch.trim()) {
        const term = docSearch.toLowerCase().trim()
        const tipo = tiposDocumentoMap.get(doc.tipoDocumentoId)
        const match =
          doc.nombre.toLowerCase().includes(term) ||
          (doc.numeroDocumento && doc.numeroDocumento.toLowerCase().includes(term)) ||
          (doc.descripcion && doc.descripcion.toLowerCase().includes(term)) ||
          (doc.nombreArchivo && doc.nombreArchivo.toLowerCase().includes(term)) ||
          (tipo?.nombre && tipo.nombre.toLowerCase().includes(term))
        if (!match) return false
      }

      return true
    })
  }, [documentos, tipoDocFilter, estadoFilter, docSearch, tiposDocumentoMap])

  async function handleViewFile(doc: ActivoDocumento) {
    try {
      setLoadingDocId(doc.id)
      const blob = await fetchAuthenticatedBlob(doc.rutaArchivo)
      const url = URL.createObjectURL(blob)
      window.open(url, "_blank")
    } catch {
      toast.error("No se pudo abrir el archivo")
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

  const Icon = getTipoActivoIcon(activo.tipoActivo?.icono)
  const color = activo.tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto p-4 sm:p-6 gap-4">
      {/* Asset Report Banner Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <AuthenticatedImage
              src={activo.urlImagen}
              alt={activo.nombre}
              className="size-12 shrink-0 rounded-xl object-cover border border-border/80 shadow-xs"
              fallbackClassName="size-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shadow-xs"
              fallback={<Icon className="size-6" />}
            />
            <div className="flex flex-col min-w-0 gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">
                  {activo.codigo}
                </span>
                <h2 className="font-heading text-base sm:text-lg font-bold text-foreground truncate">
                  {activo.nombre}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {activo.tipoActivo && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <span
                      className="size-2 rounded-full inline-block"
                      style={{ backgroundColor: color }}
                    />
                    <span>{activo.tipoActivo.nombre}</span>
                  </span>
                )}
                {activo.ubicacion && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      {activo.ubicacion.nombre}
                    </span>
                  </>
                )}
                {activo.fechaAdquisicion && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3 text-muted-foreground" />
                      Alta: {formatDateString(activo.fechaAdquisicion)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "self-start sm:self-center text-[10px] font-bold px-2 py-0.5",
              activo.activo
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground",
            )}
          >
            {activo.activo ? "OPERATIVO" : "INACTIVO"}
          </Badge>
        </div>

        {/* Stats Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-muted/20 shadow-2xs">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                Total Registrados
              </span>
              <span className="font-heading font-bold text-sm text-foreground">
                {stats.total}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">docs</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-emerald-500/5 shadow-2xs">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium truncate">
                Vigentes / OK
              </span>
              <span className="font-heading font-bold text-sm text-emerald-700 dark:text-emerald-300">
                {stats.vigentes + stats.permanentes}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-amber-500/5 shadow-2xs">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium truncate">
                Por Vencer (&lt;30d)
              </span>
              <span className="font-heading font-bold text-sm text-amber-700 dark:text-amber-300">
                {stats.porVencer}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-destructive/5 shadow-2xs">
            <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <ShieldAlert className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-destructive font-medium truncate">
                Vencidos
              </span>
              <span className="font-heading font-bold text-sm text-destructive">
                {stats.vencidos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-col gap-3.5">
        {/* Inner Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <SearchField
              value={docSearch}
              onChange={setDocSearch}
              placeholder="Buscar en los documentos de este activo..."
              className="flex-1 min-w-[200px]"
            />

            <Select value={tipoDocFilter} onValueChange={(v) => setTipoDocFilter(v ?? ALL_FILTER)}>
              <SelectTrigger className="w-full sm:w-44 h-8.5 text-xs bg-background">
                <FileCheck className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Tipo de Doc." />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value={ALL_FILTER}>Todos los tipos</SelectItem>
                {tiposDoc.map((td) => (
                  <SelectItem key={td.id} value={td.id}>
                    {td.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v ?? ALL_FILTER)}>
              <SelectTrigger className="w-full sm:w-38 h-8.5 text-xs bg-background">
                <Filter className="size-3.5 text-muted-foreground mr-1.5" />
                <SelectValue placeholder="Vigencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Todas las vigencias</SelectItem>
                <SelectItem value="vigente">Vigente</SelectItem>
                <SelectItem value="por_vencer">Por vencer (30d)</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="permanente">Permanente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(docSearch.trim() || tipoDocFilter !== ALL_FILTER || estadoFilter !== ALL_FILTER) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDocSearch("")
                setTipoDocFilter(ALL_FILTER)
                setEstadoFilter(ALL_FILTER)
              }}
              className="h-8.5 text-xs shrink-0 gap-1"
            >
              <RotateCcw className="size-3" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Content Table / States */}
        {query.isLoading ? (
          <ListSkeleton
            rows={3}
            rowClassName="h-14 rounded-xl"
            className="flex flex-col gap-2 p-0"
          />
        ) : query.isError ? (
          <EmptyState
            title="Error al cargar documentos"
            description="No se pudo obtener el historial de documentos para este activo."
            className="text-destructive py-6"
          />
        ) : documentos.length === 0 ? (
          <EmptyState
            icon={<FileSearch className="size-8 text-muted-foreground/60" />}
            title="Sin documentos registrados"
            description={`El activo ${activo.codigo} no tiene pólizas, actas ni certificados asociados en el repositorio.`}
            className="py-8"
          />
        ) : filteredDocumentos.length === 0 ? (
          <EmptyState
            icon={<Filter className="size-7 text-muted-foreground/60" />}
            title="Sin coincidencias con los filtros"
            description="No hay documentos que cumplan con los criterios de búsqueda seleccionados."
            className="py-6"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-2.5 px-3.5">
                      Documento / Referencia
                    </th>
                    <th scope="col" className="py-2.5 px-3.5">
                      Tipo
                    </th>
                    <th scope="col" className="py-2.5 px-3.5">
                      Emisión
                    </th>
                    <th scope="col" className="py-2.5 px-3.5">
                      Vencimiento / Estado
                    </th>
                    <th scope="col" className="py-2.5 px-3.5">
                      Archivo Adjunto
                    </th>
                    <th scope="col" className="py-2.5 px-3.5 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredDocumentos.map((doc) => {
                    const tipoInfo = tiposDocumentoMap.get(doc.tipoDocumentoId)
                    const estado = getDocumentoEstado(doc.fechaVencimiento)
                    const isLoading = loadingDocId === doc.id

                    return (
                      <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                        {/* Nombre y Número */}
                        <td className="py-2.5 px-3.5">
                          <div className="flex flex-col min-w-0 max-w-xs">
                            <span className="font-semibold text-foreground truncate">
                              {doc.nombre}
                            </span>
                            {doc.numeroDocumento ? (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                Ref: {doc.numeroDocumento}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 italic">
                                Sin N° de referencia
                              </span>
                            )}
                            {doc.descripcion && (
                              <span className="text-[10px] text-muted-foreground truncate line-clamp-1 pt-0.5">
                                {doc.descripcion}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tipo de Documento */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 text-[10px] font-semibold gap-1 px-1.5 py-0.2"
                          >
                            <Tag className="size-2.5" />
                            <span>{tipoInfo?.nombre ?? "Documento"}</span>
                          </Badge>
                        </td>

                        {/* Emisión */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-muted-foreground text-[11px]">
                          {formatDateString(doc.fechaEmision)}
                        </td>

                        {/* Vencimiento & Estado */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {estado === "vencido" ? (
                              <Badge
                                variant="outline"
                                className="bg-destructive/10 text-destructive border-destructive/25 text-[10px] font-bold px-1.5 py-0.2"
                              >
                                <ShieldAlert className="size-2.5 mr-1" />
                                Vencido ({formatDateString(doc.fechaVencimiento)})
                              </Badge>
                            ) : estado === "por_vencer" ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 text-[10px] font-bold px-1.5 py-0.2"
                              >
                                <Clock className="size-2.5 mr-1" />
                                Por vencer ({formatDateString(doc.fechaVencimiento)})
                              </Badge>
                            ) : estado === "vigente" ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 text-[10px] font-bold px-1.5 py-0.2"
                              >
                                <CheckCircle2 className="size-2.5 mr-1" />
                                Vigente ({formatDateString(doc.fechaVencimiento)})
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground border-border/80 text-[10px] font-medium px-1.5 py-0.2"
                              >
                                Permanente
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Archivo */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2 min-w-0 max-w-[190px]">
                            {getFileIcon(doc.nombreArchivo, doc.mimeType)}
                            <div className="flex flex-col min-w-0">
                              <span className="truncate text-[11px] text-foreground font-mono" title={doc.nombreArchivo}>
                                {doc.nombreArchivo}
                              </span>
                              <span className="text-[9px] text-muted-foreground">
                                {formatFileSize(doc.size)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Acciones de Reporte (Lectura) */}
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFile(doc)}
                              disabled={isLoading}
                              className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Visualizar documento"
                            >
                              {isLoading ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <Eye className="size-3 text-primary" />
                              )}
                              <span>Ver</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadFile(doc)}
                              disabled={isLoading}
                              className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Descargar archivo"
                            >
                              <Download className="size-3" />
                              <span>Descargar</span>
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
    </div>
  )
}

export function ActivoConsultaDocumentosPage() {
  const [tipoActivoId, setTipoActivoId] = useState<string>(ALL_FILTER)

  const search = usePaginatedSearch({
    resetKey: `${tipoActivoId}`,
  })

  // Queries
  const tiposActivoQuery = useQuery(
    tipoActivoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const tiposDocQuery = useQuery(
    tipoDocumentoQueries.list({
      page: 0,
      size: 100,
      sortBy: "nombre",
      direction: "ASC",
    }),
  )

  const activosQuery = useQuery(
    activoQueries.list({
      page: search.page,
      size: PAGE_SIZE,
      q: search.debouncedSearch.trim() || undefined,
      tipoActivoId: tipoActivoId !== ALL_FILTER ? tipoActivoId : undefined,
      sortBy: "codigo",
      direction: "ASC",
    }),
  )

  useClampPage(search.page, search.setPage, activosQuery.data?.totalPages)

  const tiposActivo = useMemo(
    () => tiposActivoQuery.data?.content ?? [],
    [tiposActivoQuery.data?.content],
  )

  const tiposDoc = useMemo(
    () => tiposDocQuery.data?.content ?? [],
    [tiposDocQuery.data?.content],
  )

  const tiposDocumentoMap = useMemo(() => {
    const map = new Map<string, TipoDocumento>()
    tiposDoc.forEach((t) => map.set(t.id, t))
    return map
  }, [tiposDoc])

  const activos = useMemo(
    () => activosQuery.data?.content ?? [],
    [activosQuery.data?.content],
  )

  const masterDetail = useMasterDetail(activos)

  return (
    <div className="flex h-full flex-col min-h-0">
      <MasterDetailLayout
        title={
          masterDetail.isMobile &&
          masterDetail.mobileShowDetail &&
          masterDetail.selected
            ? `${masterDetail.selected.nombre} (${masterDetail.selected.codigo})`
            : "Reporte GRS (Documentos)"
        }
        showMaster={masterDetail.showMaster}
        showDetail={masterDetail.showDetail}
        showBack={masterDetail.isMobile && masterDetail.mobileShowDetail}
        backLabel="Volver a lista de activos"
        onBack={masterDetail.backToMaster}
        headerAction={
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => window.print()}
              className="shrink-0 gap-1.5 text-xs shadow-2xs"
              title="Imprimir reporte"
            >
              <Printer className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Imprimir Reporte</span>
            </Button>

            <RefreshButton
              size="sm"
              queries={[activosQuery, tiposActivoQuery, tiposDocQuery]}
            />
          </div>
        }
        master={
          <MasterPanelShell
            label="Activos en Inventario"
            search={search.search}
            onSearchChange={search.setSearch}
            searchPlaceholder="Buscar por código o nombre..."
            searchAriaLabel="Buscar activo por nombre o código"
          >
            {/* Filter Tipo de Activo inside master panel */}
            <div className="border-b px-3 py-2 bg-muted/15">
              <Select
                value={tipoActivoId}
                onValueChange={(val) => {
                  setTipoActivoId(val ?? ALL_FILTER)
                  search.setPage(0)
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-background">
                  <Layers className="size-3.5 text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Tipo de Activo" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value={ALL_FILTER}>Todos los tipos de activo</SelectItem>
                  {tiposActivo.map((ta) => (
                    <SelectItem key={ta.id} value={ta.id}>
                      {ta.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* List */}
            <PaginatedList<Activo>
              items={activos}
              page={activosQuery.data}
              isLoading={activosQuery.isLoading}
              isFetching={activosQuery.isFetching}
              errorMessage={
                activosQuery.isError ? getErrorMessage(activosQuery.error) : null
              }
              hasSearch={search.search.trim().length > 0 || tipoActivoId !== ALL_FILTER}
              onPageChange={search.setPage}
              getKey={(activo) => activo.id}
              empty={{
                icon: <FileSearch className="size-4 text-muted-foreground" />,
                title: "No hay activos",
                description: "No se encontraron activos registrados en el inventario.",
                searchDescription: "Prueba modificando el criterio de búsqueda o el tipo de activo.",
              }}
            >
              {(activo) => {
                const Icon = getTipoActivoIcon(activo.tipoActivo?.icono)
                const color = activo.tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
                const isSelected = masterDetail.selectedId === activo.id

                return (
                  <SelectableListItem
                    key={activo.id}
                    active={isSelected}
                    onSelect={() => masterDetail.select(activo.id)}
                    title={
                      <div className="flex items-center gap-2 min-w-0">
                        <AuthenticatedImage
                          src={activo.urlImagen}
                          alt={activo.nombre}
                          className="size-7.5 shrink-0 rounded-lg object-cover border border-border/70"
                          fallbackClassName="size-7.5 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 text-primary"
                          fallback={<Icon className="size-3.5" />}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase bg-muted px-1 rounded shrink-0">
                              {activo.codigo}
                            </span>
                            <span className="font-semibold text-xs text-foreground truncate">
                              {activo.nombre}
                            </span>
                          </div>
                        </div>
                      </div>
                    }
                    subtitle={
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1 pl-9.5 truncate">
                        {activo.tipoActivo && (
                          <span className="flex items-center gap-1 shrink-0">
                            <span
                              className="size-1.5 rounded-full inline-block"
                              style={{ backgroundColor: color }}
                            />
                            <span className="truncate">{activo.tipoActivo.nombre}</span>
                          </span>
                        )}
                        {activo.ubicacion && (
                          <>
                            <span>•</span>
                            <span className="truncate">{activo.ubicacion.nombre}</span>
                          </>
                        )}
                      </div>
                    }
                  />
                )
              }}
            </PaginatedList>
          </MasterPanelShell>
        }
        detail={
          <DetailPanelShell
            hasSelection={Boolean(masterDetail.selected)}
            emptySelectionMessage="Selecciona un activo de la lista para visualizar su reporte documental."
          >
            {masterDetail.selected ? (
              <ActivoDetailReport
                key={masterDetail.selected.id}
                activo={masterDetail.selected}
                tiposDocumentoMap={tiposDocumentoMap}
                tiposDoc={tiposDoc}
              />
            ) : null}
          </DetailPanelShell>
        }
      />
    </div>
  )
}


