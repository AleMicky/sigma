import {
  Box,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Paperclip,
  Pencil,
  ShieldCheck,
  User,
  UserCheck,
  Wrench,
} from "lucide-react"

import { AuditInfo } from "@/shared/components/audit-info"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { formatDateTime } from "@/shared/utils/date.utils"

import type { SolicitudMantenimiento } from "../api/solicitud.service"
import {
  getEstadoBadgeStyles,
  getPrioridadBadgeStyles,
} from "./SolicitudCard"

type SolicitudQuickViewSheetProps = {
  solicitud: SolicitudMantenimiento | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (solicitud: SolicitudMantenimiento) => void
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function SolicitudQuickViewSheet({
  solicitud,
  open,
  onOpenChange,
  onEdit,
}: SolicitudQuickViewSheetProps) {
  if (!solicitud) return null

  const estadoStyle = getEstadoBadgeStyles(solicitud.estado)
  const prioridadStyle = getPrioridadBadgeStyles(solicitud.prioridad?.nivel ?? 1)
  const adjuntos = solicitud.adjuntos ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {solicitud.numero ? (
                  <code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    {solicitud.numero}
                  </code>
                ) : null}
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${estadoStyle}`}
                >
                  {solicitud.estado}
                </span>
              </div>
              {solicitud.prioridad ? (
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold ${prioridadStyle}`}
                >
                  Prioridad: {solicitud.prioridad.nombre} (Nivel {solicitud.prioridad.nivel})
                </span>
              ) : null}
            </div>

            <SheetTitle className="text-base font-heading font-semibold text-foreground text-left">
              {solicitud.titulo}
            </SheetTitle>

            {solicitud.motivoMantenimiento ? (
              <SheetDescription className="text-xs text-foreground/80 font-medium text-left">
                <span className="text-muted-foreground">Motivo:</span> {solicitud.motivoMantenimiento}
              </SheetDescription>
            ) : null}
          </div>
        </SheetHeader>

        <div className="space-y-4 py-4 text-xs">
          {/* Descripción */}
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción del Problema / Requerimiento
            </h4>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {solicitud.descripcion}
            </p>
          </div>

          {/* Activo & Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Box className="size-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Activo</span>
              </div>
              {solicitud.activo ? (
                <div>
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    {solicitud.activo.codigo}
                  </code>
                  <p className="font-semibold text-foreground mt-0.5 truncate">
                    {solicitud.activo.nombre}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No asignado</p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="size-3.5" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Tipo de Mantenimiento</span>
              </div>
              {solicitud.tipoMantenimiento ? (
                <div>
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    {solicitud.tipoMantenimiento.codigo}
                  </code>
                  <p className="font-semibold text-foreground mt-0.5 truncate">
                    {solicitud.tipoMantenimiento.nombre}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No especificado</p>
              )}
            </div>
          </div>

          {/* Workflow Phases / Ciclo de Vida */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Flujo y Ciclo de Vida
            </h4>

            <div className="space-y-2.5 divide-y divide-border/60">
              {/* Solicitud */}
              <div className="flex items-start gap-2.5 pt-2 first:pt-0">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Solicitado</p>
                    {solicitud.fechaSolicitud ? (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaSolicitud)}
                      </span>
                    ) : null}
                  </div>
                  {solicitud.solicitante ? (
                    <p className="text-[11px] text-muted-foreground">
                      Por: {solicitud.solicitante.nombre}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Aprobación */}
              <div className="flex items-start gap-2.5 pt-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <UserCheck className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Aprobación</p>
                    {solicitud.fechaAprobacion ? (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaAprobacion)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Pendiente</span>
                    )}
                  </div>
                  {solicitud.aprobadoPor ? (
                    <p className="text-[11px] text-muted-foreground">
                      Aprobador: {solicitud.aprobadoPor.nombre}
                    </p>
                  ) : null}
                  {solicitud.observacionAprobacion ? (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                      "{solicitud.observacionAprobacion}"
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Asignación y Ejecución */}
              <div className="flex items-start gap-2.5 pt-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Clock className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Ejecución</p>
                    {solicitud.fechaInicioMantenimiento ? (
                      <span className="text-[10px] text-muted-foreground">
                        Inicio: {formatDateTime(solicitud.fechaInicioMantenimiento)}
                      </span>
                    ) : null}
                  </div>
                  {solicitud.responsable ? (
                    <p className="text-[11px] text-muted-foreground">
                      Responsable: {solicitud.responsable.nombre}
                    </p>
                  ) : null}
                  {solicitud.fechaFinMantenimiento ? (
                    <p className="text-[10px] text-muted-foreground">
                      Fin: {formatDateTime(solicitud.fechaFinMantenimiento)}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Validación / Supervisión */}
              <div className="flex items-start gap-2.5 pt-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Validación</p>
                    {solicitud.fechaValidacion ? (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaValidacion)}
                      </span>
                    ) : null}
                  </div>
                  {solicitud.supervisor ? (
                    <p className="text-[11px] text-muted-foreground">
                      Supervisor: {solicitud.supervisor.nombre}
                    </p>
                  ) : null}
                  {solicitud.observacionValidacion ? (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                      "{solicitud.observacionValidacion}"
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Finalización y Cierre */}
              <div className="flex items-start gap-2.5 pt-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">Cierre</p>
                    {solicitud.fechaFinalizacion ? (
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(solicitud.fechaFinalizacion)}
                      </span>
                    ) : null}
                  </div>
                  {solicitud.recibidoPor ? (
                    <p className="text-[11px] text-muted-foreground">
                      Recibido por: {solicitud.recibidoPor.nombre}
                    </p>
                  ) : null}
                  {solicitud.observacionCierre ? (
                    <p className="text-[10px] text-muted-foreground italic mt-0.5">
                      "{solicitud.observacionCierre}"
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Adjuntos */}
          <div className="rounded-lg border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Paperclip className="size-3.5" />
                Archivos Adjuntos ({adjuntos.length})
              </h4>
            </div>

            {adjuntos.length === 0 ? (
              <p className="text-muted-foreground/60 italic text-xs py-1">
                No hay archivos adjuntos en esta solicitud.
              </p>
            ) : (
              <ul className="space-y-1.5 divide-y divide-border/40">
                {adjuntos.map((adj) => (
                  <li
                    key={adj.id}
                    className="flex items-center justify-between gap-2 pt-1.5 first:pt-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[240px]">
                          {adj.nombreArchivo}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(adj.size)}
                          {adj.descripcion ? ` • ${adj.descripcion}` : ""}
                        </p>
                      </div>
                    </div>

                    {adj.url ? (
                      <a
                        href={adj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0 p-1"
                        title="Descargar o ver archivo"
                      >
                        <Download className="size-3.5" />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Audit Info */}
          <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Información de Auditoría
            </h4>
            <AuditInfo data={solicitud} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 pt-3 border-t">
          <Button
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onEdit(solicitud)
            }}
            className="gap-1.5 text-xs"
          >
            <Pencil className="size-3.5" />
            Editar Solicitud
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
