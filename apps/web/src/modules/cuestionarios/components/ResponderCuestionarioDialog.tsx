import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  Award,
  CheckCircle2,
  EyeOff,
  RefreshCw,
  UserCheck,
} from "lucide-react"

import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { FormDialog, FormDialogSubmit } from "@/shared/components/form-dialog"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { StatusBadge } from "@/shared/components/status-badge"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Progress } from "@/shared/components/ui/progress"
import { Textarea } from "@/shared/components/ui/textarea"
import { formatDate } from "@/shared/lib/format-date"

import { useResponderAsignacionCuestionario } from "../api/cuestionario.mutations"
import { cuestionarioQueries } from "../api/cuestionario.queries"
import type { AsignacionDetalle } from "../api/cuestionario.types"
import {
  ESTADO_ASIGNACION_LABELS,
  ESTADO_ASIGNACION_VARIANT,
  buildResponderPayload,
  calculateProgresoRespuestas,
  formatNumero,
  formatPorcentaje,
  mapRespuestasDetalleToDraftMap,
  validateRespuestas,
  type RespuestaDraftMap,
} from "../lib/cuestionario.utils"
import { PreguntaRenderer } from "./PreguntaRenderer"

export type ResponderCuestionarioDialogProps = {
  asignacionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "responder" | "ver"
  onSuccess?: () => void
}

function ResponderCuestionarioBody({
  detail,
  readOnly,
  onOpenChange,
  onSuccess,
}: {
  detail: AsignacionDetalle
  readOnly: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}) {
  const { asignacion, cuestionario, respuestas } = detail

  const preguntasActivas = useMemo(
    () =>
      [...(cuestionario.preguntas ?? [])]
        .filter((p) => p.activo)
        .sort((a, b) => a.orden - b.orden),
    [cuestionario.preguntas],
  )

  const [draftMap, setDraftMap] = useState<RespuestaDraftMap>(() =>
    mapRespuestasDetalleToDraftMap(respuestas ?? []),
  )
  const [comentarioGeneral, setComentarioGeneral] = useState<string>(
    () => asignacion.comentarioGeneral ?? "",
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const responderMutation = useResponderAsignacionCuestionario()

  const progreso = useMemo(
    () => calculateProgresoRespuestas(preguntasActivas, draftMap),
    [preguntasActivas, draftMap],
  )

  const handleSubmit = async () => {
    if (readOnly) {
      onOpenChange(false)
      return
    }

    setFormError(null)
    const errors = validateRespuestas(preguntasActivas, draftMap)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setFormError(
        "Completa todas las preguntas obligatorias antes de enviar la evaluación.",
      )
      return
    }

    const payload = buildResponderPayload(
      preguntasActivas,
      draftMap,
      comentarioGeneral,
    )

    try {
      await responderMutation.mutateAsync({
        id: asignacion.id,
        payload,
      })
      onSuccess?.()
      onOpenChange(false)
    } catch (err: unknown) {
      setFormError(getErrorMessage(err))
    }
  }

  return (
    <FormDialog
      open={true}
      onOpenChange={onOpenChange}
      size="lg"
      title={cuestionario.nombre}
      description={
        cuestionario.descripcion ||
        (readOnly
          ? "Detalle de la evaluación registrada."
          : "Responde las preguntas para registrar tu evaluación.")
      }
      formError={formError}
      cancelLabel={readOnly ? "Cerrar" : "Cancelar"}
      onSubmit={handleSubmit}
      footer={
        readOnly ? null : (
          <FormDialogSubmit
            canSubmit={true}
            allowInvalidSubmit={true}
            isSubmitting={responderMutation.isPending}
            label="Enviar evaluación"
            submittingLabel="Enviando…"
          />
        )
      }
    >
      {/* Resumen de contexto de la asignación */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={ESTADO_ASIGNACION_VARIANT[asignacion.estado]}>
            {ESTADO_ASIGNACION_LABELS[asignacion.estado]}
          </StatusBadge>
          {asignacion.entidadCodigoRef ? (
            <span className="rounded-md border border-border/70 bg-background px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
              {asignacion.entidadCodigoRef}
            </span>
          ) : null}
          {asignacion.evaluadoNombre ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <UserCheck className="size-3.5 text-primary" />
              Evaluado:{" "}
              <strong className="font-semibold text-foreground">
                {asignacion.evaluadoNombre}
              </strong>
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {asignacion.anonimoEnReportes ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info">
              <EyeOff className="size-3" />
              Anónimo en reportes
            </span>
          ) : null}
          <span className="font-mono text-[11px] text-muted-foreground">
            v{cuestionario.version}
          </span>
        </div>
      </div>

      {/* Puntaje si ya fue respondido, o barra de progreso si está pendiente */}
      {readOnly && asignacion.estado === "RESPONDIDO" ? (
        <div className="grid grid-cols-1 gap-2 rounded-xl border border-success/30 bg-success/10 p-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Award className="size-4 shrink-0 text-success" />
            <div>
              <p className="text-[11px] text-muted-foreground">Calificación</p>
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatPorcentaje(asignacion.porcentaje)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Puntaje</p>
            <p className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumero(asignacion.puntajeTotal)} /{" "}
              {formatNumero(asignacion.puntajeMaximo)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Respondido el</p>
            <p className="text-xs font-medium text-foreground">
              {formatDate(asignacion.fechaRespuesta)}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 rounded-xl border border-border/70 bg-card p-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <CheckCircle2 className="size-3.5 text-primary" />
              Progreso: {progreso.respondidas} de {progreso.totalActivas}{" "}
              preguntas
            </span>
            <span className="font-mono font-semibold text-primary tabular-nums">
              {progreso.porcentaje}%
            </span>
          </div>
          <Progress
            value={progreso.porcentaje}
            max={100}
            aria-label="Progreso del cuestionario"
            indicatorClassName="bg-primary"
          />
          {progreso.obligatoriasTotal > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Obligatorias completadas: {progreso.obligatoriasRespondidas} de{" "}
              {progreso.obligatoriasTotal}
            </p>
          ) : null}
        </div>
      )}

      {/* Preguntas */}
      <div className="space-y-3">
        {preguntasActivas.map((pregunta, index) => {
          const seccionActual = pregunta.seccion?.trim() || null
          const seccionAnterior =
            index > 0 ? preguntasActivas[index - 1]?.seccion?.trim() || null : null
          const showSeccion = Boolean(
            seccionActual && seccionActual !== seccionAnterior,
          )

          return (
            <div key={pregunta.id} className="space-y-2">
              {showSeccion ? (
                <h4 className="pt-1 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {seccionActual}
                </h4>
              ) : null}
              <PreguntaRenderer
                pregunta={pregunta}
                index={index}
                value={draftMap[pregunta.id]}
                readOnly={readOnly}
                error={fieldErrors[pregunta.id]}
                onChange={(nextVal) => {
                  setDraftMap((prev) => ({ ...prev, [pregunta.id]: nextVal }))
                  if (fieldErrors[pregunta.id]) {
                    setFieldErrors((prev) => {
                      const next = { ...prev }
                      delete next[pregunta.id]
                      return next
                    })
                  }
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Comentario general */}
      <Field>
        <FieldLabel htmlFor="cuestionario-comentario-general">
          Comentario general (Opcional)
        </FieldLabel>
        <Textarea
          id="cuestionario-comentario-general"
          rows={3}
          disabled={readOnly}
          value={comentarioGeneral}
          placeholder={
            readOnly
              ? "Sin comentarios adicionales"
              : "Agrega observaciones adicionales sobre el servicio o experiencia…"
          }
          onChange={(event) => setComentarioGeneral(event.target.value)}
          className="rounded-lg"
        />
      </Field>
    </FormDialog>
  )
}

export function ResponderCuestionarioDialog({
  asignacionId,
  open,
  onOpenChange,
  mode = "responder",
  onSuccess,
}: Readonly<ResponderCuestionarioDialogProps>) {
  const detailQuery = useQuery({
    ...cuestionarioQueries.asignacionDetail(asignacionId ?? ""),
    enabled: Boolean(open && asignacionId),
  })

  if (!open || !asignacionId) return null

  if (detailQuery.isLoading) {
    return (
      <FormDialog
        open={true}
        onOpenChange={onOpenChange}
        size="lg"
        title="Cargando evaluación…"
        description="Obteniendo las preguntas del cuestionario."
        cancelLabel="Cerrar"
        onSubmit={() => undefined}
        footer={null}
      >
        <div aria-busy="true">
          <ListSkeleton rows={4} rowClassName="h-16 rounded-xl" />
        </div>
      </FormDialog>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <FormDialog
        open={true}
        onOpenChange={onOpenChange}
        size="md"
        title="Error al cargar la evaluación"
        description="No fue posible obtener los detalles del cuestionario."
        cancelLabel="Cerrar"
        onSubmit={() => undefined}
        footer={null}
      >
        <EmptyState
          icon={<AlertCircle className="size-6 text-destructive" />}
          title="No se pudo cargar el cuestionario"
          description={getErrorMessage(detailQuery.error)}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void detailQuery.refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              Reintentar
            </Button>
          }
        />
      </FormDialog>
    )
  }

  const isReadOnly =
    mode === "ver" || detailQuery.data.asignacion.estado !== "PENDIENTE"

  return (
    <ResponderCuestionarioBody
      key={`${detailQuery.data.asignacion.id}-${detailQuery.data.asignacion.estado}-${mode}`}
      detail={detailQuery.data}
      readOnly={isReadOnly}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  )
}
