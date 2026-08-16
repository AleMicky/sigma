import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Edit2,
  FileText,
  History,
  ImageIcon,
  MapPin,
  Printer,
  ShieldCheck,
  Sliders,
  UserCheck,
  Users,
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
import { cn } from "@/shared/lib/utils"

import { activoQueries } from "../api/activo.queries"

type ActivoDetailPageProps = {
  activoId: string
}

type TabType = "ficha" | "asignaciones" | "historial" | "auditoria"

export function ActivoDetailPage({ activoId }: ActivoDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ficha")

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

  function copyCode() {
    if (!activo?.codigo) return
    navigator.clipboard.writeText(activo.codigo)
    toast.success("Código copiado al portapapeles")
  }

  function handlePrint() {
    window.print()
  }

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
              <Button size="sm" render={<Link to={routes.activos.root} />}>
                <ArrowLeft className="size-4" />
                Volver a la lista de activos
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
      {/* Top Action Header */}
      <header className="flex shrink-0 flex-col gap-2.5 border-b py-2.5 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-xs"
              render={<Link to={routes.activos.root} />}
              aria-label="Volver al catálogo de activos"
              title="Volver al catálogo"
              className="size-7.5 shrink-0 rounded-lg shadow-2xs hover:bg-accent"
            >
              <ArrowLeft className="size-3.5" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Catálogo de Activos
              </span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-[11px] font-medium text-foreground font-mono truncate">
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
              className="h-8 px-2.5 text-xs font-medium shadow-xs"
            >
              <Edit2 className="size-3.5" />
              Editar Activo
            </Button>
          </div>
        </div>

        {/* Hero Card with Color Top Accent */}
        <div
          className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}14 0%, ${color}04 100%)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: color }}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 min-w-0 flex-1">
            <div className="relative group shrink-0">
              <AuthenticatedImage
                src={activo.urlImagen}
                alt={activo.nombre}
                className="size-20 sm:size-22 rounded-xl object-cover shadow-2xs border border-border/60 bg-background"
                fallbackClassName="size-20 sm:size-22 rounded-xl bg-background flex items-center justify-center border border-border/60 shadow-2xs"
                fallback={<ImageIcon className="size-8 text-muted-foreground/40" />}
              />
              <span
                className="absolute -bottom-1 -right-1 flex size-6.5 items-center justify-center rounded-lg text-white shadow-xs"
                style={{ backgroundColor: color }}
              >
                <Icon className="size-3.5" />
              </span>
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyCode}
                  className="group inline-flex items-center gap-1.5 rounded-md bg-background/90 border border-border/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground shadow-2xs hover:bg-muted transition-colors cursor-pointer"
                  title="Click para copiar código"
                >
                  <span>{activo.codigo}</span>
                  <Copy className="size-3 text-muted-foreground group-hover:text-foreground" />
                </button>

                {tipoActivo ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md bg-background/80 text-foreground border border-border/60 shadow-2xs">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {tipoActivo.nombre}
                  </span>
                ) : null}

                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                  <CheckCircle2 className="size-3" />
                  Operativo
                </span>
              </div>

              <h1 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                {activo.nombre}
              </h1>

              <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {activo.descripcion || "Sin descripción registrada para este activo."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-border/60 md:pl-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate">
                {ubicacion?.nombre || "Sin ubicación asignada"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3.5 text-indigo-500 shrink-0" />
              <span>
                {activo.fechaAdquisicion
                  ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Fecha adquisición: S/R"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border/60 pt-2 pb-1 no-scrollbar">
          <Button
            size="sm"
            variant={activeTab === "ficha" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("ficha")}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 transition-all",
              activeTab === "ficha"
                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Sliders className="size-3.5" />
            <span>Ficha Técnica & Atributos</span>
            {atributosDef.length > 0 && (
              <span className="size-4.5 rounded-full bg-primary/15 text-[10px] inline-flex items-center justify-center font-bold">
                {atributosDef.length}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant={activeTab === "asignaciones" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("asignaciones")}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 transition-all",
              activeTab === "asignaciones"
                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <UserCheck className="size-3.5" />
            <span>Asignaciones & Custodia</span>
          </Button>

          <Button
            size="sm"
            variant={activeTab === "historial" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("historial")}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 transition-all",
              activeTab === "historial"
                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <History className="size-3.5" />
            <span>Historial & Movimientos</span>
          </Button>

          <Button
            size="sm"
            variant={activeTab === "auditoria" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("auditoria")}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-lg gap-1.5 transition-all",
              activeTab === "auditoria"
                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ShieldCheck className="size-3.5" />
            <span>Auditoría</span>
          </Button>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="py-4 flex flex-col gap-4">
        {/* TAB 1: FICHA TÉCNICA Y ATRIBUTOS */}
        {activeTab === "ficha" && (
          <div className="flex flex-col gap-4">
            {/* General Info Card */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <FileText className="size-4 text-primary" />
                Información General del Activo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Código Institucional</span>
                  <span className="font-semibold text-foreground font-mono text-sm">{activo.codigo}</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Tipo de Activo</span>
                  <span className="font-semibold text-foreground">{tipoActivo?.nombre || "No especificado"}</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Ubicación Actual</span>
                  <span className="font-semibold text-foreground">{ubicacion?.nombre || "Sin ubicación"}</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Fecha de Adquisición</span>
                  <span className="font-semibold text-foreground">
                    {activo.fechaAdquisicion
                      ? new Date(activo.fechaAdquisicion).toLocaleDateString("es-ES")
                      : "No registrada"}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Estado Operativo</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Activo / Operativo</span>
                </div>

                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Condición</span>
                  <span className="font-semibold text-foreground">Excelente estado</span>
                </div>
              </div>
            </div>

            {/* Dynamic Attributes Grid */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sliders className="size-4 text-indigo-500" />
                  Especificaciones & Atributos Personalizados ({atributosDef.length})
                </h3>

                <Button
                  size="sm"
                  variant="outline"
                  render={<Link to={routes.activos.editar(activo.id)} />}
                  className="h-7 px-2 text-[11px]"
                >
                  <Edit2 className="size-3" />
                  Actualizar Valores
                </Button>
              </div>

              {atributosDef.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3">
                  Este tipo de activo no cuenta con atributos específicos configurados.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  {atributosDef.map((attr) => {
                    const valor = valoresByAtributoId.get(attr.id)
                    return (
                      <div
                        key={attr.id}
                        className="p-3 rounded-lg border border-border/60 bg-muted/15 flex flex-col gap-1 transition-all hover:bg-muted/30"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold text-muted-foreground truncate">
                            {attr.etiqueta}
                          </span>
                          {attr.requerido && (
                            <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded">
                              REQ
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-foreground text-sm truncate">
                          {valor || <span className="text-muted-foreground/60 italic text-xs">No registrado</span>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ASIGNACIONES Y CUSTODIA */}
        {activeTab === "asignaciones" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="size-4 text-emerald-500" />
                  Custodia & Asignación Actual
                </h3>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Users className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                      Custodio Actual
                    </span>
                    <span className="font-bold text-sm sm:text-base text-foreground">
                      Custodia General / Almacén Central
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Ubicación: {ubicacion?.nombre || "Planta Principal ENDE Corani"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Activo Disponible para Asignación
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment History Log */}
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <History className="size-4 text-primary" />
                Historial de Responsables y Traspasos
              </h3>

              <div className="relative pl-6 border-l border-border/80 space-y-4 my-2">
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Recepción y Registro en Catálogo</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {activo.createdAt ? new Date(activo.createdAt).toLocaleDateString("es-ES") : "Reciente"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ingreso del activo al sistema de gestión con código institucional <span className="font-mono text-foreground font-semibold">{activo.codigo}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HISTORIAL Y MOVIMIENTOS */}
        {activeTab === "historial" && (
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
              <History className="size-4 text-primary" />
              Línea de Tiempo del Activo (Trazabilidad)
            </h3>

            <div className="relative pl-6 border-l border-border/80 space-y-6 my-2">
              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-primary ring-4 ring-background" />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Alta del Activo en el Sistema</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                      {activo.createdAt ? new Date(activo.createdAt).toLocaleString("es-ES") : "Reciente"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se registró formalmente el activo "{activo.nombre}" bajo el tipo de activo "{tipoActivo?.nombre || "General"}".
                  </p>
                </div>
              </div>

              {activo.updatedAt && activo.updatedAt !== activo.createdAt && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 size-3.5 rounded-full bg-indigo-500 ring-4 ring-background" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Actualización de Ficha</span>
                      <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                        {new Date(activo.updatedAt).toLocaleString("es-ES")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se modificaron los datos o especificaciones técnicas del activo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDITORÍA */}
        {activeTab === "auditoria" && (
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-amber-500" />
              Metadatos & Registro de Auditoría
            </h3>

            <div className="p-3 bg-muted/20 rounded-lg border border-border/60 mb-4">
              <AuditInfo data={activo} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/15 flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">ID del Registro (UUID)</span>
                <span className="font-mono text-xs text-foreground select-all">{activo.id}</span>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-muted/15 flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Tipo de Activo ID</span>
                <span className="font-mono text-xs text-foreground select-all">{activo.tipoActivoId}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageShell>
  )
}
