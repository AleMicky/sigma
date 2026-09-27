import { useMemo, useState } from "react"
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  History,
  IdCard,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDate } from "@/shared/lib/format-date"
import { cn } from "@/shared/lib/utils"

import type { Conductor, ConductorLicencia } from "../api/conductor.service"

type ConductorDetailPanelProps = {
  conductor: Conductor | null
  onEditConductor: (conductor: Conductor) => void
  onAddLicencia: (conductor: Conductor) => void
  onEditLicencia: (conductor: Conductor, licencia: ConductorLicencia) => void
  onDeleteLicencia: (conductor: Conductor, licencia: ConductorLicencia) => void
  onPrev?: () => void
  onNext?: () => void
}

function getInitials(name?: string | null): string {
  const clean = (name || "").trim()
  if (!clean) return "CD"
  const parts = clean.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getCategoryColor(cat?: string | null) {
  const c = (cat || "").toUpperCase()
  switch (c) {
    case "M":
    case "P":
      return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25"
    case "A":
      return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25"
    case "B":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
    case "C":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
    case "T":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
    default:
      return "bg-primary/10 text-primary border-primary/25"
  }
}

export function ConductorDetailPanel({
  conductor,
  onEditConductor,
  onAddLicencia,
  onEditLicencia,
  onDeleteLicencia,
  onPrev,
  onNext,
}: ConductorDetailPanelProps) {
  const [copiedLicencia, setCopiedLicencia] = useState<string | null>(null)

  const nombre = conductor?.empleado?.nombreCompleto || "Conductor Seleccionado"
  const codigo = conductor?.empleado?.codigo || "-"
  const cargo = conductor?.empleado?.cargo || "Conductor Institucional"
  const area = conductor?.empleado?.area || "Operaciones y Logística"
  const licencias: ConductorLicencia[] = conductor?.licencias || []
  const initials = getInitials(nombre)

  const hoy = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Separar Licencia Vigente vs Historial
  const { licenciaVigente, historialLicencias } = useMemo(() => {
    const vigente = licencias.find((l) => l.estado === "VIGENTE")
    const historial = licencias.filter((l) => l !== vigente)
    return { licenciaVigente: vigente, historialLicencias: historial }
  }, [licencias])

  // Estado del vencimiento de la licencia vigente
  const vencimientoVigente = useMemo(() => {
    if (!licenciaVigente || !licenciaVigente.fechaVencimiento) return null

    const diffDays = Math.ceil(
      (new Date(licenciaVigente.fechaVencimiento).getTime() - hoy.getTime()) /
        86_400_000
    )

    if (diffDays < 0) {
      return {
        text: `Vencida hace ${Math.abs(diffDays)} días`,
        dot: "bg-destructive",
        badge: "text-destructive bg-destructive/10 border-destructive/30",
        isExpired: true,
      }
    }
    if (diffDays <= 30) {
      return {
        text: `Vence en ${diffDays} días`,
        dot: "bg-amber-500",
        badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
        isExpiring: true,
      }
    }
    return {
      text: `Vigente (${diffDays} días)`,
      dot: "bg-emerald-500",
      badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      isValid: true,
    }
  }, [licenciaVigente, hoy])

  function copyText(val: string) {
    navigator.clipboard.writeText(val)
    setCopiedLicencia(val)
    toast.success(`Copiado: ${val}`)
    setTimeout(() => setCopiedLicencia(null), 2000)
  }

  if (!conductor) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background/50">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground mb-3">
          <Car className="size-6" />
        </div>
        <h3 className="font-semibold text-sm text-foreground">
          Ningún conductor seleccionado
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Selecciona un conductor de la lista izquierda para ver su información y detalle de licencias.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background overflow-y-auto">
      {/* 1. Breadcrumbs & Top Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-6 py-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="hover:text-foreground transition-colors cursor-pointer">
            Conductores
          </span>
          <span className="opacity-40">/</span>
          <span className="font-medium text-foreground truncate max-w-[240px]">
            {nombre}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onPrev && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onPrev}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
          {onNext && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onNext}
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEditConductor(conductor)}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground ml-1"
            title="Editar conductor"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 space-y-7 w-full max-w-5xl">
        {/* Header Block with Big Icon + Title + Edit Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            {/* Top Icon Badge */}
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-2xs">
              <IdCard className="size-5" />
            </div>

            {/* Supertitle */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 dark:text-amber-400">
                CONDUCTOR INSTITUCIONAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {nombre}
              </h1>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {conductor.observacion ||
                `Conductor autorizado para la asignación y operación de vehículos del parque automotor institucional, adscrito al área de ${area}.`}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditConductor(conductor)}
            className="shrink-0 gap-1.5 rounded-lg border-border/80 text-xs font-semibold px-3 py-1.5 h-8 hover:bg-muted shadow-2xs cursor-pointer"
          >
            <Pencil className="size-3.5" />
            Editar Conductor
          </Button>
        </div>

        {/* 3. Metadata Grid Card (Responsable · Estado · Vencimiento) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border border-border/60 bg-muted/15 p-1 divide-y sm:divide-y-0 sm:divide-x divide-border/50 shadow-2xs">
          {/* Titular */}
          <div className="flex flex-col gap-1.5 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              RESPONSABLE / TITULAR
            </span>
            <div className="flex items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {nombre}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {codigo} · {cargo}
                </span>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="flex flex-col gap-1.5 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              ESTADO DEL CONDUCTOR
            </span>
            <div className="flex items-center gap-2 h-7">
              <span
                className={cn(
                  "size-2 rounded-full",
                  conductor.activo && conductor.estado === "ACTIVO"
                    ? "bg-emerald-500"
                    : "bg-zinc-400"
                )}
              />
              <span className="text-xs font-semibold text-foreground">
                {conductor.activo ? conductor.estado : "Inactivo / Inhabilitado"}
              </span>
            </div>
          </div>

          {/* Licencias / Vigencia */}
          <div className="flex flex-col gap-1.5 p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              LICENCIA ACTIVA
            </span>
            <div className="flex items-center gap-2 h-7">
              {licenciaVigente ? (
                <>
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      vencimientoVigente?.dot || "bg-emerald-500"
                    )}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Cat. {licenciaVigente.categoriaLicencia} · {vencimientoVigente?.text || "Vigente"}
                  </span>
                </>
              ) : (
                <>
                  <span className="size-2 rounded-full bg-zinc-400" />
                  <span className="text-xs text-muted-foreground">
                    Sin licencia vigente
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 4. SECCIÓN: LICENCIA VIGENTE ACTUAL (DESTACADA) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Licencia Vigente (Credencial Activa)
              </h3>
            </div>

            <Button
              size="sm"
              onClick={() => onAddLicencia(conductor)}
              className="gap-1.5 text-xs font-semibold h-8 rounded-lg shadow-2xs cursor-pointer"
            >
              <Plus className="size-3.5" />
              Nueva Licencia
            </Button>
          </div>

          {licenciaVigente ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] p-5 space-y-4 shadow-2xs hover:border-emerald-500/50 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl font-bold text-base border shadow-2xs",
                      getCategoryColor(licenciaVigente.categoriaLicencia)
                    )}
                  >
                    {licenciaVigente.categoriaLicencia}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        Categoría {licenciaVigente.categoriaLicencia}
                      </span>
                      <Badge className="bg-emerald-500 text-white text-[10px] font-semibold">
                        VIGENTE
                      </Badge>
                      {vencimientoVigente && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1 text-[10px] font-medium border",
                            vencimientoVigente.badge
                          )}
                        >
                          <Clock className="size-2.5 shrink-0" />
                          {vencimientoVigente.text}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono font-semibold text-foreground">
                        Nº {licenciaVigente.numeroLicencia}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyText(licenciaVigente.numeroLicencia)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copiar número"
                      >
                        {copiedLicencia === licenciaVigente.numeroLicencia ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {licenciaVigente.url && (
                    <a
                      href={licenciaVigente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted shadow-2xs"
                    >
                      <FileText className="size-3.5" />
                      <span>{licenciaVigente.nombreOriginal || "Ver Adjunto"}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditLicencia(conductor, licenciaVigente)}
                    className="h-8 text-xs gap-1 font-semibold"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                </div>
              </div>

              {/* Grid de Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/15 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">
                    Fecha de Emisión
                  </span>
                  <span className="font-medium text-foreground">
                    {licenciaVigente.fechaEmision
                      ? formatDate(licenciaVigente.fechaEmision)
                      : "-"}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-semibold text-muted-foreground uppercase">
                    Fecha de Vencimiento
                  </span>
                  <span className="font-semibold text-foreground">
                    {licenciaVigente.fechaVencimiento
                      ? formatDate(licenciaVigente.fechaVencimiento)
                      : "-"}
                  </span>
                </div>
              </div>

              {licenciaVigente.observacion && (
                <div className="rounded-xl bg-muted/40 p-2.5 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Nota: </span>
                  {licenciaVigente.observacion}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground space-y-2">
              <ShieldAlert className="size-8 text-amber-500 mx-auto opacity-70" />
              <p className="font-medium text-foreground">
                No hay una licencia vigente registrada
              </p>
              <p className="text-[11px] text-muted-foreground">
                Registra la licencia activa del conductor para habilitar asignaciones vehiculares.
              </p>
              <Button
                size="sm"
                onClick={() => onAddLicencia(conductor)}
                className="mt-2 text-xs gap-1.5"
              >
                <Plus className="size-3.5" />
                Registrar Licencia Vigente
              </Button>
            </div>
          )}
        </div>

        {/* 5. SECCIÓN: HISTORIAL DE LICENCIAS ANTERIORES */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              Historial de Licencias Anteriores
            </h3>
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {historialLicencias.length}
            </Badge>
          </div>

          {historialLicencias.length === 0 ? (
            <div className="rounded-xl border border-border/40 p-4 text-center text-xs text-muted-foreground">
              Sin licencias previas en el historial.
            </div>
          ) : (
            <div className="space-y-2">
              {historialLicencias.map((lic, index) => {
                const isCopied = copiedLicencia === lic.numeroLicencia

                return (
                  <div
                    key={lic.id || index}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/40 hover:bg-muted/20 p-3 transition-colors opacity-85 hover:opacity-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs border",
                          getCategoryColor(lic.categoriaLicencia)
                        )}
                      >
                        {lic.categoriaLicencia}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs text-foreground">
                            Categoría {lic.categoriaLicencia}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            · {lic.numeroLicencia}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyText(lic.numeroLicencia)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copiar número"
                          >
                            {isCopied ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                          <Badge
                            variant="outline"
                            className="text-[9.5px] border-zinc-500/30 text-muted-foreground"
                          >
                            {lic.estado || "VENCIDA"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground mt-0.5">
                          {lic.fechaEmision && (
                            <span>Emisión: {formatDate(lic.fechaEmision)}</span>
                          )}
                          {lic.fechaVencimiento && (
                            <>
                              <span>•</span>
                              <span>Venció: {formatDate(lic.fechaVencimiento)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {lic.url && (
                        <a
                          href={lic.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                          title="Ver documento adjunto"
                        >
                          <FileText className="size-3 text-muted-foreground" />
                          <span>Adjunto</span>
                          <ExternalLink className="size-2.5 text-muted-foreground" />
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onEditLicencia(conductor, lic)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-primary"
                        title="Editar esta licencia"
                      >
                        <Pencil className="size-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDeleteLicencia(conductor, lic)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
