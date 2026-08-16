import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileCheck,
  FilePlus,
  FileSearch,
  FileSpreadsheet,
  FileText,
  History,
  ImageIcon,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Package,
  Plus,
  Printer,
  RotateCcw,
  Route,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Tag,
  Upload,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import { activoAtributoQueries } from "@/modules/activos/activo-atributo/api/activo-atributo.queries"
import { activoAtributoValorQueries } from "@/modules/activos/activo-atributo-valor/api/activo-atributo-valor.queries"
import { tipoActivoQueries } from "@/modules/activos/tipo-activo/api/tipo-activo.queries"
import { DEFAULT_TIPO_ACTIVO_COLOR } from "@/modules/activos/tipo-activo/lib/tipo-activo-colors"
import { getTipoActivoIcon } from "@/modules/activos/tipo-activo/lib/tipo-activo-icons"
import { ubicacionQueries } from "@/modules/parametros/ubicacion/api/ubicacion.queries"
import { getErrorMessage } from "@/shared/api"
import { AuditInfo } from "@/shared/components/audit-info"
import { AuthenticatedImage } from "@/shared/components/authenticated-image"
import { EmptyState } from "@/shared/components/empty-state"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { PageShell } from "@/shared/components/page-shell"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogClose,
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
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"

type ActivoDetailPageProps = {
  activoId: string
}

type TabType = "informacion" | "documentacion" | "asignacion" | "historial" | "auditoria"

interface DocumentoItem {
  id: string
  titulo: string
  codigoRef: string
  tipo: string
  fechaEmision: string
  fechaVencimiento: string
  estado: "vigente" | "por_vencer" | "vencido"
  tamano: string
  archivoUrl?: string
}

interface MantenimientoItem {
  id: string
  tipo: "preventivo" | "correctivo" | "inspeccion"
  titulo: string
  fecha: string
  kilometraje?: string
  responsable: string
  costo?: string
  observaciones: string
}

export function ActivoDetailPage({ activoId }: ActivoDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("informacion")
  const [docFilter, setDocFilter] = useState<string>("todos")
  const [docSearch, setDocSearch] = useState<string>("")
  const [isAddDocOpen, setIsAddDocOpen] = useState(false)
  const [isMantenimientoOpen, setIsMantenimientoOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Form states for new document
  const [newDocTitle, setNewDocTitle] = useState("")
  const [newDocTipo, setNewDocTipo] = useState("SOAT")
  const [newDocExpiry, setNewDocExpiry] = useState("")
  const [newDocRef, setNewDocRef] = useState("")

  // Form states for maintenance
  const [newMaintType, setNewMaintType] = useState<"preventivo" | "correctivo">("preventivo")
  const [newMaintTitle, setNewMaintTitle] = useState("")
  const [newMaintKm, setNewMaintKm] = useState("")
  const [newMaintResp, setNewMaintResp] = useState("")
  const [newMaintObs, setNewMaintObs] = useState("")

  const activoQuery = useQuery(activoQueries.detail(activoId))
  const activo = activoQuery.data

  const tipoActivoQuery = useQuery({
    ...tipoActivoQueries.detail(activo?.tipoActivoId ?? ""),
    enabled: Boolean(activo?.tipoActivoId),
  })
  const tipoActivo = tipoActivoQuery.data

  const ubicacionQuery = useQuery({
    ...ubicacionQueries.detail(activo?.ubicacionId ?? ""),
    enabled: Boolean(activo?.ubicacionId),
  })
  const ubicacion = ubicacionQuery.data

  const atributosDefQuery = useQuery({
    ...activoAtributoQueries.byTipoActivo(activo?.tipoActivoId ?? ""),
    enabled: Boolean(activo?.tipoActivoId),
  })
  const atributosDef = atributosDefQuery.data?.content ?? []

  const valoresQuery = useQuery(activoAtributoValorQueries.byActivo(activoId))
  const valores = valoresQuery.data?.content ?? []

  const valoresByAtributoId = useMemo(() => {
    const map = new Map<string, string>()
    valores.forEach((v) => {
      if (v.activoAtributoId && v.valor) {
        map.set(v.activoAtributoId, v.valor)
      }
    })
    return map
  }, [valores])

  const color = tipoActivo?.color || DEFAULT_TIPO_ACTIVO_COLOR
  const Icon = getTipoActivoIcon(tipoActivo?.icono)

  // Mock list of documents for this asset
  const [documentos, setDocumentos] = useState<DocumentoItem[]>([
    {
      id: "doc-1",
      titulo: "SOAT Vigente",
      codigoRef: "SOAT-2026-99482",
      tipo: "Seguro Obligatorio",
      fechaEmision: "15/11/2025",
      fechaVencimiento: "15/11/2026",
      estado: "vigente",
      tamano: "1.4 MB",
    },
    {
      id: "doc-2",
      titulo: "Revisión Técnica Vehicular",
      codigoRef: "RTV-0824-2025",
      tipo: "Inspección Técnica",
      fechaEmision: "28/05/2025",
      fechaVencimiento: "28/05/2026",
      estado: "por_vencer",
      tamano: "2.8 MB",
    },
    {
      id: "doc-3",
      titulo: "Póliza de Seguro Todo Riesgo",
      codigoRef: "POL-SEC-58291",
      tipo: "Póliza de Seguro",
      fechaEmision: "10/01/2025",
      fechaVencimiento: "10/01/2027",
      estado: "vigente",
      tamano: "3.5 MB",
    },
    {
      id: "doc-4",
      titulo: "Acta de Asignación y Recepción",
      codigoRef: "ACTA-ENT-0012",
      tipo: "Acta de Custodia",
      fechaEmision: "12/01/2025",
      fechaVencimiento: "Indefinida",
      estado: "vigente",
      tamano: "850 KB",
    },
    {
      id: "doc-5",
      titulo: "Manual de Operación & Ficha de Fábrica",
      codigoRef: "MAN-FAB-001",
      tipo: "Manual Técnico",
      fechaEmision: "01/01/2024",
      fechaVencimiento: "No Aplica",
      estado: "vigente",
      tamano: "5.2 MB",
    },
  ])

  // Mock list of maintenance history
  const [mantenimientos, setMantenimientos] = useState<MantenimientoItem[]>([
    {
      id: "maint-1",
      tipo: "preventivo",
      titulo: "Mantenimiento Preventivo 40,000 km",
      fecha: "10/01/2026",
      kilometraje: "40,150 km",
      responsable: "Taller Central ENDE",
      costo: "Bs. 1,450",
      observaciones: "Cambio de aceite sintético, filtros de aire y combustible, alineación y balanceo.",
    },
    {
      id: "maint-2",
      tipo: "inspeccion",
      titulo: "Inspección de Seguridad Semestral",
      fecha: "15/11/2025",
      kilometraje: "36,800 km",
      responsable: "Dpto. de Seguridad Industrial",
      observaciones: "Verificación de luces, frenos, botiquín, extintor y equipo de emergencia. Aprobado sin observaciones.",
    },
    {
      id: "maint-3",
      tipo: "preventivo",
      titulo: "Mantenimiento Preventivo 30,000 km",
      fecha: "05/06/2025",
      kilometraje: "30,200 km",
      responsable: "Servicio Autorizado Toyosa",
      costo: "Bs. 1,820",
      observaciones: "Reemplazo de pastillas de frenos y revisión de suspensión.",
    },
  ])

  function copyCode() {
    if (!activo?.codigo) return
    navigator.clipboard.writeText(activo.codigo)
    toast.success("Código copiado al portapapeles")
  }

  function handlePrint() {
    window.print()
  }

  function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    if (!newDocTitle.trim()) {
      toast.error("Por favor ingresa un título para el documento")
      return
    }

    const newDoc: DocumentoItem = {
      id: `doc-${Date.now()}`,
      titulo: newDocTitle.trim(),
      codigoRef: newDocRef.trim() || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo: newDocTipo,
      fechaEmision: new Date().toLocaleDateString("es-ES"),
      fechaVencimiento: newDocExpiry || "15/12/2026",
      estado: "vigente",
      tamano: "1.2 MB",
    }

    setDocumentos((prev) => [newDoc, ...prev])
    setIsAddDocOpen(false)
    setNewDocTitle("")
    setNewDocRef("")
    setNewDocExpiry("")
    toast.success("Documento registrado correctamente en el activo")
  }

  function handleAddMantenimiento(e: React.FormEvent) {
    e.preventDefault()
    if (!newMaintTitle.trim()) {
      toast.error("Por favor describe el mantenimiento realizado")
      return
    }

    const newMaint: MantenimientoItem = {
      id: `maint-${Date.now()}`,
      tipo: newMaintType,
      titulo: newMaintTitle.trim(),
      fecha: new Date().toLocaleDateString("es-ES"),
      kilometraje: newMaintKm.trim() || undefined,
      responsable: newMaintResp.trim() || "Taller Mecánico Central",
      observaciones: newMaintObs.trim() || "Mantenimiento completado satisfactoriamente.",
    }

    setMantenimientos((prev) => [newMaint, ...prev])
    setIsMantenimientoOpen(false)
    setNewMaintTitle("")
    setNewMaintKm("")
    setNewMaintResp("")
    setNewMaintObs("")
    toast.success("Registro de mantenimiento guardado exitosamente")
  }

  const filteredDocumentos = useMemo(() => {
    return documentos.filter((doc) => {
      const matchSearch =
        doc.titulo.toLowerCase().includes(docSearch.toLowerCase()) ||
        doc.codigoRef.toLowerCase().includes(docSearch.toLowerCase()) ||
        doc.tipo.toLowerCase().includes(docSearch.toLowerCase())

      if (!matchSearch) return false

      if (docFilter === "todos") return true
      return doc.estado === docFilter
    })
  }, [documentos, docSearch, docFilter])

  if (activoQuery.isLoading) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-6 flex flex-col gap-4">
          <ListSkeleton rows={3} rowClassName="h-28 rounded-xl" />
        </div>
      </PageShell>
    )
  }

  if (activoQuery.isError || !activo) {
    return (
      <PageShell size="xl" layout="fill" padding="compact">
        <div className="py-12 flex flex-col items-center justify-center">
          <EmptyState
            title={getErrorMessage(activoQuery.error) || "Activo no encontrado"}
            description="El activo solicitado no existe o fue eliminado del sistema."
            action={
              <Button size="sm" render={<Link to={routes.activos.catalogo} />}>
                <ArrowLeft className="size-4" />
                Volver al catálogo de activos
              </Button>
            }
            className="text-destructive"
          />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell size="xl" layout="scroll" padding="compact">
      {/* Top Header Breadcrumb & Actions */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-xs"
              render={<Link to={routes.activos.catalogo} />}
              aria-label="Volver al catálogo de activos"
              title="Volver al catálogo"
              className="size-7.5 shrink-0 rounded-lg shadow-2xs hover:bg-accent"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to={routes.activos.catalogo}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Catálogo
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-xs font-bold text-foreground font-mono truncate">
                {activo.codigo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 px-2.5 text-xs font-medium"
              title="Imprimir Ficha Técnica"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">Imprimir Ficha</span>
            </Button>

            <Button
              size="sm"
              render={<Link to={routes.activos.editar(activo.id)} />}
              className="h-8 px-3 text-xs font-medium shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit2 className="size-3.5" />
              Editar Información
            </Button>
          </div>
        </div>

        {/* Hero Card matching the reference layout */}
        <div
          className="relative flex flex-col md:flex-row items-stretch gap-4 p-4 sm:p-5 rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}12 0%, ${color}03 100%)`,
          }}
        >
          {/* Top Accent Color Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: color }}
          />

          {/* Left: Asset Preview Image */}
          <div className="relative shrink-0 w-full sm:w-64 md:w-72 aspect-[16/10] sm:aspect-auto sm:h-40 rounded-xl overflow-hidden border border-border/70 bg-background/60 shadow-2xs group">
            <AuthenticatedImage
              src={activo.urlImagen}
              alt={activo.nombre}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackClassName="size-full bg-muted/40 flex flex-col items-center justify-center text-muted-foreground/50"
              fallback={
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="size-8 opacity-40" />
                  <span className="text-[11px] font-medium tracking-wide">Sin imagen</span>
                </div>
              }
            />
            {/* Quick Zoom Trigger */}
            {activo.urlImagen && (
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="absolute bottom-2 right-2 size-7 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs hover:bg-black/80"
                title="Ampliar imagen"
              >
                <Maximize2 className="size-3.5" />
              </button>
            )}
          </div>

          {/* Center/Right: Title, Subtitle, Status, and Action Buttons */}
          <div className="flex flex-1 flex-col justify-between gap-3 min-w-0">
            <div className="flex flex-col gap-1.5">
              {/* Top Row: Icon + Code + Status Badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-lg text-white shadow-xs"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="group inline-flex items-center gap-1.5 font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer"
                    title="Click para copiar código"
                  >
                    <span>{activo.codigo}</span>
                    <Copy className="size-3.5 text-muted-foreground opacity-50 group-hover:opacity-100" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {tipoActivo ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-background border border-border/70 shadow-2xs">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {tipoActivo.nombre}
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-2xs">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operativo
                  </span>
                </div>
              </div>

              {/* Subtitle / Asset Details */}
              <div className="flex flex-col">
                <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
                  {activo.nombre}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {activo.descripcion || "Activo catalogado y verificado en el sistema integral de gestión."}
                </p>
              </div>
            </div>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="default"
                render={<Link to={routes.activos.editar(activo.id)} />}
                className="h-8.5 px-3.5 text-xs font-semibold shadow-xs"
              >
                <Edit2 className="size-3.5" />
                Editar Información
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsMantenimientoOpen(true)}
                className="h-8.5 px-3.5 text-xs font-semibold shadow-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30"
              >
                <Wrench className="size-3.5" />
                Registrar Mantenimiento
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setActiveTab("documentacion")
                  setIsAddDocOpen(true)
                }}
                className="h-8.5 px-3.5 text-xs font-semibold shadow-xs"
              >
                <FilePlus className="size-3.5 text-primary" />
                Adjuntar Documento
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/70 pt-1 pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("informacion")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === "informacion"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <Sliders className="size-3.5" />
            <span>Información</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("documentacion")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === "documentacion"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <FileCheck className="size-3.5" />
            <span>Documentación</span>
            <span className="size-5 rounded-full bg-primary/15 text-primary text-[10px] inline-flex items-center justify-center font-bold">
              {documentos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("asignacion")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === "asignacion"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <UserCheck className="size-3.5" />
            <span>Asignación</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("historial")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === "historial"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <History className="size-3.5" />
            <span>Historial</span>
            <span className="size-5 rounded-full bg-muted text-muted-foreground text-[10px] inline-flex items-center justify-center font-bold">
              {mantenimientos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("auditoria")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              activeTab === "auditoria"
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>Auditoría</span>
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="py-4 flex flex-col gap-4">
        {/* TAB 1: INFORMACIÓN GENERAL & ATRIBUTOS TÉCNICOS */}
        {activeTab === "informacion" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Main Column: Atributos Técnicos & Highlight Status Cards */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Technical Attributes Card */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Info className="size-4" />
                    </div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                      Atributos Técnicos & Especificaciones
                    </h3>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    render={<Link to={routes.activos.editar(activo.id)} />}
                    className="h-7 px-2 text-xs text-primary hover:text-primary"
                  >
                    <Edit2 className="size-3" />
                    Editar
                  </Button>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                  {/* Default / Core Attributes */}
                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Código Institucional
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {activo.codigo}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Tipo de Activo
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {tipoActivo?.nombre || "No especificado"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Sede / Ubicación
                    </span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 truncate">
                      <MapPin className="size-3.5 text-primary shrink-0" />
                      {ubicacion?.nombre || "Sin ubicación"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Fecha de Adquisición
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {activo.fechaAdquisicion
                        ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No registrada"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Estado Operativo
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Activo / Operativo
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/20">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Condición Actual
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      Excelente estado
                    </span>
                  </div>

                  {/* Dynamic Type Attributes */}
                  {atributosDef.map((attr) => {
                    const valor = valoresByAtributoId.get(attr.id)
                    return (
                      <div
                        key={attr.id}
                        className="flex flex-col gap-1 p-3 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                            {attr.etiqueta}
                          </span>
                          {attr.requerido && (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded">
                              REQ
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground truncate">
                          {valor || (
                            <span className="text-muted-foreground/60 italic text-xs font-normal">
                              No registrado
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Two Highlight Cards (Próximo Servicio & Bitácora Activa) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Highlight 1: Próximo Servicio */}
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 shadow-2xs">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Próximo Servicio / Mantenimiento
                    </span>
                    <span className="text-xl font-heading font-black text-foreground">
                      50,000 km
                    </span>
                    <span className="text-xs text-muted-foreground">
                      En aprox. 4,800 km o 45 días
                    </span>
                  </div>

                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    <Wrench className="size-5" />
                  </div>
                </div>

                {/* Highlight 2: Bitácora Activa */}
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Bitácora Activa / Asignación
                    </span>
                    <span className="text-base font-heading font-bold text-foreground truncate">
                      Operación Sede Central
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Custodio: Ing. Carlos Mendoza
                    </span>
                  </div>

                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Route className="size-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Documentación Clave */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="size-4.5 text-primary" />
                    <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                      Documentación Clave
                    </h3>
                  </div>

                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {documentos.length} docs
                  </span>
                </div>

                {/* Document List */}
                <div className="flex flex-col gap-2.5">
                  {documentos.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-center justify-between gap-2.5 p-3 rounded-xl border transition-all",
                        doc.estado === "vigente"
                          ? "border-border/70 bg-muted/20 hover:border-primary/40"
                          : doc.estado === "por_vencer"
                          ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                          : "border-destructive/30 bg-destructive/5 hover:border-destructive/50",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            doc.estado === "vigente"
                              ? "bg-primary/10 text-primary"
                              : doc.estado === "por_vencer"
                              ? "bg-amber-500/15 text-amber-600"
                              : "bg-destructive/15 text-destructive",
                          )}
                        >
                          <FileText className="size-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">
                            {doc.titulo}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Vence: {doc.fechaVencimiento}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {doc.estado === "vigente" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                            Vigente
                          </span>
                        ) : doc.estado === "por_vencer" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                            Próximo a vencer
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-destructive/15 text-destructive border border-destructive/25">
                            Vencido
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Document Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDocOpen(true)}
                  className="w-full h-9 text-xs font-semibold border-dashed hover:border-primary hover:text-primary gap-1.5"
                >
                  <Plus className="size-3.5" />
                  Agregar Documento
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTACIÓN COMPLETA */}
        {activeTab === "documentacion" && (
          <div className="flex flex-col gap-4">
            {/* Header / Filter Toolbar for Documents */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/80 bg-card shadow-2xs">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Buscar documento por título o código..."
                    className="h-8.5 pl-8 text-xs"
                  />
                </div>

                <Select value={docFilter} onValueChange={(val) => setDocFilter(val ?? "todos")}>
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
                onClick={() => setIsAddDocOpen(true)}
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
                  <Button size="sm" onClick={() => setIsAddDocOpen(true)}>
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
                        <span className="font-medium text-foreground text-xs">{doc.fechaEmision}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Vencimiento
                        </span>
                        <span className="font-medium text-foreground text-xs">{doc.fechaVencimiento}</span>
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
        )}

        {/* TAB 3: ASIGNACIONES & CUSTODIA */}
        {activeTab === "asignacion" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="size-5 text-emerald-500" />
                  <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                    Custodio y Responsable Actual
                  </h3>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Custodia Activa
                </span>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    CM
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                      Responsable Directo
                    </span>
                    <span className="font-heading text-base font-bold text-foreground">
                      Ing. Carlos Mendoza R.
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Supervisor de Mantenimiento & Flota · Sede {ubicacion?.nombre || "Planta Principal"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info("Generando acta de custodia...")}
                    className="h-8 text-xs font-semibold"
                  >
                    <FileText className="size-3.5" />
                    Ver Acta de Entrega
                  </Button>
                </div>
              </div>
            </div>

            {/* Assignment Timeline */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <h3 className="font-heading text-sm sm:text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <History className="size-4 text-primary" />
                Historial de Responsables y Traspasos
              </h3>

              <div className="relative pl-6 border-l border-border/80 space-y-4 my-2">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Asignación Formal a Ing. Carlos Mendoza R.
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        15/01/2025
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entrega de llaves, ficha técnica y acta de responsabilidad para operación en {ubicacion?.nombre || "Sede Principal"}.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Recepción de Adquisición en Almacén Central
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {activo.createdAt ? new Date(activo.createdAt).toLocaleDateString("es-ES") : "Reciente"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ingreso inicial del activo con código institucional <span className="font-mono text-foreground font-semibold">{activo.codigo}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HISTORIAL & MANTENIMIENTOS */}
        {activeTab === "historial" && (
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <History className="size-5 text-primary" />
                <h3 className="font-heading text-sm sm:text-base font-bold text-foreground">
                  Bitácora de Mantenimiento & Trazabilidad
                </h3>
              </div>

              <Button
                size="sm"
                onClick={() => setIsMantenimientoOpen(true)}
                className="h-8 text-xs font-semibold shadow-xs"
              >
                <Plus className="size-3.5" />
                Registrar Mantenimiento
              </Button>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l border-border/80 space-y-6 my-2">
              {mantenimientos.map((maint) => (
                <div key={maint.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[31px] top-1 size-3.5 rounded-full ring-4 ring-background",
                      maint.tipo === "preventivo"
                        ? "bg-amber-500"
                        : maint.tipo === "correctivo"
                        ? "bg-destructive"
                        : "bg-primary",
                    )}
                  />
                  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-border/70 bg-muted/15">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {maint.titulo}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.2 rounded-md uppercase",
                            maint.tipo === "preventivo"
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : maint.tipo === "correctivo"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary",
                          )}
                        >
                          {maint.tipo}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {maint.fecha}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {maint.observaciones}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      {maint.kilometraje && (
                        <span>Odómetro: <strong className="text-foreground">{maint.kilometraje}</strong></span>
                      )}
                      <span>Responsable: <strong className="text-foreground">{maint.responsable}</strong></span>
                      {maint.costo && (
                        <span>Costo: <strong className="text-foreground">{maint.costo}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Alta event */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Alta y Registro en el Catálogo</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                      {activo.createdAt ? new Date(activo.createdAt).toLocaleString("es-ES") : "Reciente"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se registró formalmente el activo "{activo.nombre}" bajo el tipo "{tipoActivo?.nombre || "General"}".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDITORÍA */}
        {activeTab === "auditoria" && (
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col gap-4">
            <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-amber-500" />
              Metadatos & Registro de Auditoría
            </h3>

            <div className="p-3 bg-muted/20 rounded-xl border border-border/60">
              <AuditInfo data={activo} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  ID del Registro (UUID)
                </span>
                <span className="font-mono text-xs text-foreground select-all">
                  {activo.id}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Tipo de Activo ID
                </span>
                <span className="font-mono text-xs text-foreground select-all">
                  {activo.tipoActivoId}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: REGISTRAR MANTENIMIENTO */}
      <Dialog open={isMantenimientoOpen} onOpenChange={setIsMantenimientoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="size-4.5 text-primary" />
              Registrar Mantenimiento
            </DialogTitle>
            <DialogDescription>
              Registra un servicio preventivo, correctivo o inspección técnica para el activo {activo.codigo}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMantenimiento} className="flex flex-col gap-3 py-2 text-xs">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Tipo de Mantenimiento</Label>
              <Select
                value={newMaintType}
                onValueChange={(val) => setNewMaintType(val as "preventivo" | "correctivo")}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventivo">Mantenimiento Preventivo</SelectItem>
                  <SelectItem value="correctivo">Mantenimiento Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Título / Descripción corta</Label>
              <Input
                value={newMaintTitle}
                onChange={(e) => setNewMaintTitle(e.target.value)}
                placeholder="Ej. Cambio de filtros y aceite motor"
                className="h-8.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Kilometraje / Horas</Label>
                <Input
                  value={newMaintKm}
                  onChange={(e) => setNewMaintKm(e.target.value)}
                  placeholder="Ej. 45,230 km"
                  className="h-8.5 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Taller / Responsable</Label>
                <Input
                  value={newMaintResp}
                  onChange={(e) => setNewMaintResp(e.target.value)}
                  placeholder="Ej. Taller Mecánico Central"
                  className="h-8.5 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Detalle / Observaciones técnicas</Label>
              <Textarea
                value={newMaintObs}
                onChange={(e) => setNewMaintObs(e.target.value)}
                placeholder="Detalla los trabajos y repuestos utilizados..."
                className="text-xs min-h-[70px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMantenimientoOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Guardar Registro
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: AGREGAR DOCUMENTO */}
      <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePlus className="size-4.5 text-primary" />
              Adjuntar Documento
            </DialogTitle>
            <DialogDescription>
              Asocia una póliza, certificación, acta o comprobante técnico al activo {activo.codigo}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDocument} className="flex flex-col gap-3 py-2 text-xs">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Tipo de Documento</Label>
              <Select value={newDocTipo} onValueChange={setNewDocTipo}>
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOAT">SOAT / Seguro Obligatorio</SelectItem>
                  <SelectItem value="Revisión Técnica">Revisión Técnica Vehicular</SelectItem>
                  <SelectItem value="Póliza de Seguro">Póliza de Seguro</SelectItem>
                  <SelectItem value="Acta de Custodia">Acta de Custodia / Entrega</SelectItem>
                  <SelectItem value="Garantía / Factura">Garantía / Factura de Compra</SelectItem>
                  <SelectItem value="Manual Técnico">Manual Técnico / Catálogo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Título del Documento</Label>
              <Input
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Ej. SOAT 2026 - Renovación Anual"
                className="h-8.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">N° de Póliza / Código Ref.</Label>
                <Input
                  value={newDocRef}
                  onChange={(e) => setNewDocRef(e.target.value)}
                  placeholder="Ej. POL-9921-A"
                  className="h-8.5 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Fecha Vencimiento</Label>
                <Input
                  value={newDocExpiry}
                  onChange={(e) => setNewDocExpiry(e.target.value)}
                  placeholder="Ej. 15/11/2026"
                  className="h-8.5 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Archivo Adjunto (PDF, JPG, PNG)</Label>
              <div className="p-4 border-2 border-dashed border-border/80 rounded-xl bg-muted/20 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/40 transition-colors cursor-pointer text-center">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">
                  Arrastra o selecciona un archivo
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Formatos permitidos: PDF, JPG, PNG (Máx 10 MB)
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddDocOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Guardar Documento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: FULL IMAGE PREVIEW */}
      {isImageModalOpen && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-3xl p-2 bg-background/95 backdrop-blur-md">
            <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-black/20">
              <AuthenticatedImage
                src={activo.urlImagen}
                alt={activo.nombre}
                className="size-full object-contain"
                fallback={<div className="size-full flex items-center justify-center">Sin imagen</div>}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </PageShell>
  )
}
