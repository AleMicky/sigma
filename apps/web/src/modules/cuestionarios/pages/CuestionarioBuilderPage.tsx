import { useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  CopyPlus,
  Eye,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { routes } from "@/app/config/routes"
import { useAuthStore } from "@/app/store/auth.store"
import { getErrorMessage } from "@/shared/api"
import { EmptyState } from "@/shared/components/empty-state"
import { FormSection } from "@/shared/components/form-section"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { OptionsCombobox } from "@/shared/components/options-combobox"
import { PageShell } from "@/shared/components/page-shell"
import { StatusBadge } from "@/shared/components/status-badge"
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Progress } from "@/shared/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"
import { isAdminUser } from "@/shared/hooks/use-allowed-nav-items"
import { cn } from "@/shared/lib/utils"

import {
  useGuardarPreguntasCuestionario,
  useNuevaVersionCuestionario,
  usePublicarCuestionario,
} from "../api/cuestionario.mutations"
import { cuestionarioQueries } from "../api/cuestionario.queries"
import type {
  CuestionarioDetalle,
  TipoPregunta,
} from "../api/cuestionario.types"
import { PreguntaRenderer } from "../components/PreguntaRenderer"
import {
  ESTADO_CUESTIONARIO_LABELS,
  ESTADO_CUESTIONARIO_VARIANT,
  TIPO_PREGUNTA_OPTIONS,
  calculateProgresoRespuestas,
  createEmptyOpcionDraft,
  createEmptyPreguntaDraft,
  isConflictActiveCuestionarioError,
  mapDraftsToPreviewPreguntas,
  mapPreguntasToDrafts,
  slugifyOptionValue,
  tipoPreguntaRequiereOpciones,
  toGuardarPreguntasPayload,
  type PreguntaDraft,
  type RespuestaDraftMap,
} from "../lib/cuestionario.utils"
import { guardarPreguntasSchema } from "../schemas/cuestionario.schema"

export type CuestionarioBuilderPageProps = {
  cuestionarioId: string
}

function CuestionarioBuilderEditor({
  cuestionario,
  isAdmin,
}: {
  cuestionario: CuestionarioDetalle
  isAdmin: boolean
}) {
  const navigate = useNavigate()
  const nextIdRef = useRef(1)
  const makeClientId = (prefix: string) => {
    const id = `${prefix}-${nextIdRef.current}`
    nextIdRef.current += 1
    return id
  }

  const [drafts, setDrafts] = useState<PreguntaDraft[]>(() =>
    mapPreguntasToDrafts(cuestionario.preguntas ?? []),
  )
  const [validationError, setValidationError] = useState<string | null>(null)
  const [questionErrors, setQuestionErrors] = useState<Record<number, string>>(
    {},
  )
  const [previewDraftMap, setPreviewDraftMap] = useState<RespuestaDraftMap>({})
  const [conflictPublishMessage, setConflictPublishMessage] = useState<
    string | null
  >(null)

  const guardarMutation = useGuardarPreguntasCuestionario()
  const nuevaVersionMutation = useNuevaVersionCuestionario()
  const publicarMutation = usePublicarCuestionario()

  const hasResponses = cuestionario.totalRespuestas > 0
  const isReadOnly = !isAdmin || hasResponses

  const previewPreguntas = useMemo(
    () => mapDraftsToPreviewPreguntas(drafts),
    [drafts],
  )
  const previewProgreso = useMemo(
    () => calculateProgresoRespuestas(previewPreguntas, previewDraftMap),
    [previewPreguntas, previewDraftMap],
  )

  const updatePregunta = (
    index: number,
    updater: (prev: PreguntaDraft) => PreguntaDraft,
  ) => {
    setDrafts((prev) =>
      prev.map((item, idx) => (idx === index ? updater(item) : item)),
    )
    setValidationError(null)
    setQuestionErrors((prev) => {
      if (!(index in prev)) return prev
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const handleAddPregunta = () => {
    setDrafts((prev) => [
      ...prev,
      createEmptyPreguntaDraft(makeClientId("pregunta")),
    ])
    setValidationError(null)
  }

  const handleDuplicatePregunta = (index: number) => {
    setDrafts((prev) => {
      const source = prev[index]
      if (!source) return prev
      const clone: PreguntaDraft = {
        ...source,
        clientId: makeClientId("pregunta"),
        id: undefined,
        enunciado: source.enunciado ? `${source.enunciado} (copia)` : "",
        opciones: source.opciones.map((opt) => ({
          ...opt,
          clientId: makeClientId("opcion"),
          id: undefined,
        })),
      }
      const next = [...prev]
      next.splice(index + 1, 0, clone)
      return next
    })
  }

  const handleDeletePregunta = (index: number) => {
    setDrafts((prev) => prev.filter((_, idx) => idx !== index))
    setQuestionErrors({})
  }

  const handleMovePregunta = (index: number, delta: -1 | 1) => {
    const targetIndex = index + delta
    if (targetIndex < 0 || targetIndex >= drafts.length) return
    setDrafts((prev) => {
      const next = [...prev]
      const [moved] = next.splice(index, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
    setQuestionErrors({})
  }

  const handleChangeTipo = (index: number, nextTipo: TipoPregunta) => {
    updatePregunta(index, (prev) => {
      const needsOpts = tipoPreguntaRequiereOpciones(nextTipo)
      const opciones =
        needsOpts && prev.opciones.length < 2
          ? [
              ...prev.opciones,
              ...Array.from(
                { length: 2 - prev.opciones.length },
                (_, offset) =>
                  createEmptyOpcionDraft(
                    prev.opciones.length + offset + 1,
                    makeClientId("opcion"),
                  ),
              ),
            ]
          : prev.opciones

      return {
        ...prev,
        tipoPregunta: nextTipo,
        opciones,
      }
    })
  }

  const handleAddOpcion = (preguntaIndex: number) => {
    updatePregunta(preguntaIndex, (prev) => ({
      ...prev,
      opciones: [
        ...prev.opciones,
        createEmptyOpcionDraft(
          prev.opciones.length + 1,
          makeClientId("opcion"),
        ),
      ],
    }))
  }

  const handleRemoveOpcion = (preguntaIndex: number, opcionIndex: number) => {
    updatePregunta(preguntaIndex, (prev) => ({
      ...prev,
      opciones: prev.opciones.filter((_, idx) => idx !== opcionIndex),
    }))
  }

  const handleSave = async () => {
    if (isReadOnly) return
    setValidationError(null)
    setQuestionErrors({})

    const payload = toGuardarPreguntasPayload(drafts)
    const parsed = guardarPreguntasSchema.safeParse(payload)

    if (!parsed.success) {
      const perQuestion: Record<number, string> = {}
      let rootMsg: string | null = null

      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "preguntas" && typeof issue.path[1] === "number") {
          const qIdx = issue.path[1]
          if (!perQuestion[qIdx]) {
            perQuestion[qIdx] = issue.message
          }
        } else if (!rootMsg) {
          rootMsg = issue.message
        }
      }

      setQuestionErrors(perQuestion)
      setValidationError(
        rootMsg ||
          "Revisa las preguntas marcadas antes de guardar los cambios.",
      )
      return
    }

    try {
      await guardarMutation.mutateAsync({
        id: cuestionario.id,
        payload,
      })
    } catch {
      // Notificado por la mutación
    }
  }

  const handleNuevaVersion = async () => {
    try {
      const created = await nuevaVersionMutation.mutateAsync(cuestionario.id)
      void navigate({
        to: routes.cuestionarios.constructor(created.id),
      })
    } catch {
      // Notificado por la mutación
    }
  }

  const handlePublicar = async (reemplazarActivo = false) => {
    try {
      await publicarMutation.mutateAsync({
        id: cuestionario.id,
        reemplazarActivo,
      })
      setConflictPublishMessage(null)
    } catch (err: unknown) {
      if (!reemplazarActivo && isConflictActiveCuestionarioError(err)) {
        setConflictPublishMessage(getErrorMessage(err))
      } else {
        toast.error(getErrorMessage(err))
      }
    }
  }

  return (
    <PageShell size="xl" padding="default" layout="scroll" className="space-y-4">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <Link
            to={routes.cuestionarios.root}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Volver a cuestionarios
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {cuestionario.nombre}
            </h1>
            <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              {cuestionario.codigo} · v{cuestionario.version}
            </span>
            <StatusBadge
              variant={ESTADO_CUESTIONARIO_VARIANT[cuestionario.estado]}
            >
              {ESTADO_CUESTIONARIO_LABELS[cuestionario.estado]}
            </StatusBadge>
          </div>
          {cuestionario.descripcion ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {cuestionario.descripcion}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (hasResponses || cuestionario.estado !== "BORRADOR") ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={nuevaVersionMutation.isPending}
              onClick={() => void handleNuevaVersion()}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <CopyPlus className="size-4" />
              {nuevaVersionMutation.isPending
                ? "Creando versión…"
                : "Crear nueva versión"}
            </Button>
          ) : null}

          {isAdmin && cuestionario.estado === "BORRADOR" ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={publicarMutation.isPending || drafts.length === 0}
              onClick={() => void handlePublicar(false)}
              className="h-9 gap-1.5 rounded-xl border-success/40 bg-success/10 text-xs font-semibold text-success hover:bg-success/20 hover:text-success"
            >
              <Play className="size-3.5" />
              Publicar
            </Button>
          ) : null}

          {!isReadOnly ? (
            <Button
              type="button"
              size="lg"
              disabled={guardarMutation.isPending}
              onClick={() => void handleSave()}
              className="h-9 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <Save className="size-4" />
              {guardarMutation.isPending
                ? "Guardando…"
                : "Guardar preguntas"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Aviso si ya tiene respuestas registradas */}
      {hasResponses ? (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3.5 text-xs text-warning"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
                Este cuestionario ya cuenta con {cuestionario.totalRespuestas}{" "}
                respuesta(s) registrada(s)
              </p>
              <p className="text-muted-foreground">
                Para preservar la trazabilidad histórica, las preguntas están en
                modo solo lectura. Crea una nueva versión para modificarlas.
              </p>
            </div>
          </div>
          {isAdmin ? (
            <Button
              type="button"
              size="sm"
              disabled={nuevaVersionMutation.isPending}
              onClick={() => void handleNuevaVersion()}
              className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
            >
              <CopyPlus className="size-3.5" />
              Crear nueva versión
            </Button>
          ) : null}
        </div>
      ) : null}

      {validationError ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      ) : null}

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList className="h-9 rounded-xl p-1">
          <TabsTrigger value="editor" className="gap-1.5 rounded-lg px-3 text-xs">
            <ListChecks className="size-3.5" />
            Constructor ({drafts.length})
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="gap-1.5 rounded-lg px-3 text-xs"
          >
            <Eye className="size-3.5" />
            Vista previa en vivo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <FormSection
            title="Preguntas del cuestionario"
            description="Define el orden, tipo de respuesta, peso y obligatoriedad de cada pregunta."
            columns={1}
            action={
              !isReadOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPregunta}
                  className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
                >
                  <Plus className="size-3.5" />
                  Agregar pregunta
                </Button>
              ) : undefined
            }
          >
            {drafts.length === 0 ? (
              <EmptyState
                bordered
                icon={<ListChecks className="size-6 text-muted-foreground" />}
                title="Este cuestionario aún no tiene preguntas"
                description="Agrega tu primera pregunta para empezar a diseñar la evaluación."
                action={
                  !isReadOnly ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddPregunta}
                      className="gap-1.5"
                    >
                      <Plus className="size-3.5" />
                      Agregar primera pregunta
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                {drafts.map((draft, index) => {
                  const qError = questionErrors[index]
                  const showOpciones = tipoPreguntaRequiereOpciones(
                    draft.tipoPregunta,
                  )

                  return (
                    <article
                      key={draft.clientId}
                      className={cn(
                        "space-y-3 rounded-xl border border-border/80 bg-background/60 p-4",
                        qError && "border-destructive/60 bg-destructive/5",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            Pregunta #{index + 1}
                          </span>
                        </div>

                        {!isReadOnly ? (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              disabled={index === 0}
                              aria-label={`Subir pregunta ${index + 1}`}
                              title="Subir"
                              onClick={() => handleMovePregunta(index, -1)}
                            >
                              <ArrowUp />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              disabled={index === drafts.length - 1}
                              aria-label={`Bajar pregunta ${index + 1}`}
                              title="Bajar"
                              onClick={() => handleMovePregunta(index, 1)}
                            >
                              <ArrowDown />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              aria-label={`Duplicar pregunta ${index + 1}`}
                              title="Duplicar"
                              onClick={() => handleDuplicatePregunta(index)}
                            >
                              <Copy />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-xs"
                              aria-label={`Eliminar pregunta ${index + 1}`}
                              title="Eliminar"
                              onClick={() => handleDeletePregunta(index)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                        <Field className="md:col-span-7">
                          <FieldLabel htmlFor={`q-${draft.clientId}-enunciado`}>
                            Enunciado <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id={`q-${draft.clientId}-enunciado`}
                            value={draft.enunciado}
                            disabled={isReadOnly}
                            placeholder="Ej. ¿Cómo calificas la puntualidad del conductor?"
                            onChange={(event) =>
                              updatePregunta(index, (prev) => ({
                                ...prev,
                                enunciado: event.target.value,
                              }))
                            }
                            className="h-9 rounded-xl text-xs"
                          />
                        </Field>

                        <Field className="md:col-span-5">
                          <FieldLabel htmlFor={`q-${draft.clientId}-tipo`}>
                            Tipo de pregunta
                          </FieldLabel>
                          <OptionsCombobox
                            id={`q-${draft.clientId}-tipo`}
                            size="sm"
                            options={TIPO_PREGUNTA_OPTIONS}
                            value={draft.tipoPregunta}
                            disabled={isReadOnly}
                            ariaLabel={`Tipo de pregunta ${index + 1}`}
                            onValueChange={(next) => {
                              if (next) {
                                handleChangeTipo(index, next as TipoPregunta)
                              }
                            }}
                          />
                        </Field>

                        <Field className="md:col-span-4">
                          <FieldLabel htmlFor={`q-${draft.clientId}-seccion`}>
                            Sección (Opcional)
                          </FieldLabel>
                          <Input
                            id={`q-${draft.clientId}-seccion`}
                            value={draft.seccion}
                            disabled={isReadOnly}
                            placeholder="Ej. Conducción y Seguridad"
                            onChange={(event) =>
                              updatePregunta(index, (prev) => ({
                                ...prev,
                                seccion: event.target.value,
                              }))
                            }
                            className="h-9 rounded-xl text-xs"
                          />
                        </Field>

                        <Field className="md:col-span-5">
                          <FieldLabel htmlFor={`q-${draft.clientId}-ayuda`}>
                            Texto de ayuda (Opcional)
                          </FieldLabel>
                          <Input
                            id={`q-${draft.clientId}-ayuda`}
                            value={draft.descripcionAyuda}
                            disabled={isReadOnly}
                            placeholder="Instrucción breve para orientar la respuesta"
                            onChange={(event) =>
                              updatePregunta(index, (prev) => ({
                                ...prev,
                                descripcionAyuda: event.target.value,
                              }))
                            }
                            className="h-9 rounded-xl text-xs"
                          />
                        </Field>

                        <Field className="md:col-span-1">
                          <FieldLabel htmlFor={`q-${draft.clientId}-peso`}>
                            Peso
                          </FieldLabel>
                          <Input
                            id={`q-${draft.clientId}-peso`}
                            type="number"
                            min={0}
                            step="0.5"
                            value={draft.peso}
                            disabled={isReadOnly}
                            onChange={(event) =>
                              updatePregunta(index, (prev) => ({
                                ...prev,
                                peso: event.target.value,
                              }))
                            }
                            className="h-9 rounded-xl text-xs tabular-nums"
                          />
                        </Field>

                        <div className="flex items-end md:col-span-2">
                          <div className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-card px-2.5">
                            <label
                              htmlFor={`q-${draft.clientId}-obligatoria`}
                              className="cursor-pointer text-xs font-medium text-foreground"
                            >
                              Obligatoria
                            </label>
                            <button
                              id={`q-${draft.clientId}-obligatoria`}
                              type="button"
                              role="switch"
                              disabled={isReadOnly}
                              aria-checked={draft.obligatoria}
                              onClick={() =>
                                updatePregunta(index, (prev) => ({
                                  ...prev,
                                  obligatoria: !prev.obligatoria,
                                }))
                              }
                              className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                draft.obligatoria
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30",
                                isReadOnly && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <span
                                className={cn(
                                  "pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-xs transition-transform",
                                  draft.obligatoria
                                    ? "translate-x-4"
                                    : "translate-x-0",
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Editor de opciones para OPCION_UNICA / OPCION_MULTIPLE */}
                      {showOpciones ? (
                        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/25 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">
                              Opciones de respuesta
                            </p>
                            {!isReadOnly ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => handleAddOpcion(index)}
                                className="gap-1"
                              >
                                <Plus className="size-3" />
                                Agregar opción
                              </Button>
                            ) : null}
                          </div>

                          <div className="space-y-2">
                            {draft.opciones.map((opt, optIdx) => (
                              <div
                                key={opt.clientId}
                                className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center"
                              >
                                <Input
                                  aria-label={`Etiqueta opción ${optIdx + 1} de pregunta ${index + 1}`}
                                  value={opt.etiqueta}
                                  disabled={isReadOnly}
                                  placeholder={`Etiqueta opción ${optIdx + 1}`}
                                  onChange={(event) => {
                                    const nextEtiqueta = event.target.value
                                    updatePregunta(index, (prev) => ({
                                      ...prev,
                                      opciones: prev.opciones.map((o, i) =>
                                        i === optIdx
                                          ? {
                                              ...o,
                                              etiqueta: nextEtiqueta,
                                              valor: slugifyOptionValue(
                                                nextEtiqueta,
                                                optIdx + 1,
                                              ),
                                            }
                                          : o,
                                      ),
                                    }))
                                  }}
                                  className="h-8 rounded-lg text-xs sm:col-span-6"
                                />
                                <Input
                                  aria-label={`Valor opción ${optIdx + 1} de pregunta ${index + 1}`}
                                  value={opt.valor}
                                  disabled={isReadOnly}
                                  placeholder="VALOR"
                                  onChange={(event) =>
                                    updatePregunta(index, (prev) => ({
                                      ...prev,
                                      opciones: prev.opciones.map((o, i) =>
                                        i === optIdx
                                          ? { ...o, valor: event.target.value }
                                          : o,
                                      ),
                                    }))
                                  }
                                  className="h-8 rounded-lg font-mono text-xs sm:col-span-3"
                                />
                                <Input
                                  aria-label={`Puntaje opción ${optIdx + 1} de pregunta ${index + 1}`}
                                  type="number"
                                  step="any"
                                  value={opt.puntaje}
                                  disabled={isReadOnly}
                                  placeholder="Puntaje"
                                  onChange={(event) =>
                                    updatePregunta(index, (prev) => ({
                                      ...prev,
                                      opciones: prev.opciones.map((o, i) =>
                                        i === optIdx
                                          ? {
                                              ...o,
                                              puntaje: event.target.value,
                                            }
                                          : o,
                                      ),
                                    }))
                                  }
                                  className="h-8 rounded-lg text-xs tabular-nums sm:col-span-2"
                                />
                                {!isReadOnly ? (
                                  <div className="flex justify-end sm:col-span-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={draft.opciones.length <= 2}
                                      aria-label={`Eliminar opción ${optIdx + 1}`}
                                      onClick={() =>
                                        handleRemoveOpcion(index, optIdx)
                                      }
                                      className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {qError ? <FieldError>{qError}</FieldError> : null}
                    </article>
                  )
                })}

                {!isReadOnly ? (
                  <div className="flex justify-center pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPregunta}
                      className="h-9 gap-1.5 rounded-xl border-dashed text-xs font-semibold"
                    >
                      <Plus className="size-3.5" />
                      Agregar otra pregunta
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </FormSection>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <FormSection
            title="Vista previa interactiva"
            description="Prueba cómo responderán los usuarios este cuestionario (los valores ingresados aquí no se guardan)."
            columns={1}
            action={
              Object.keys(previewDraftMap).length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewDraftMap({})}
                  className="h-8 rounded-lg text-xs"
                >
                  Limpiar vista previa
                </Button>
              ) : undefined
            }
          >
            {previewPreguntas.length === 0 ? (
              <EmptyState
                bordered
                icon={<Eye className="size-6 text-muted-foreground" />}
                title="Sin preguntas para previsualizar"
                description="Agrega preguntas en la pestaña Constructor para ver la simulación en vivo."
              />
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      Progreso simulado: {previewProgreso.respondidas} de{" "}
                      {previewProgreso.totalActivas}
                    </span>
                    <span className="font-mono font-semibold text-primary tabular-nums">
                      {previewProgreso.porcentaje}%
                    </span>
                  </div>
                  <Progress
                    value={previewProgreso.porcentaje}
                    max={100}
                    indicatorClassName="bg-primary"
                  />
                </div>

                <div className="space-y-3">
                  {previewPreguntas.map((pregunta, index) => (
                    <PreguntaRenderer
                      key={pregunta.id}
                      pregunta={pregunta}
                      index={index}
                      idPrefix="preview"
                      value={previewDraftMap[pregunta.id]}
                      onChange={(nextVal) =>
                        setPreviewDraftMap((prev) => ({
                          ...prev,
                          [pregunta.id]: nextVal,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </FormSection>
        </TabsContent>
      </Tabs>

      {/* Conflicto al publicar desde constructor */}
      <AlertDialog
        open={Boolean(conflictPublishMessage)}
        onOpenChange={(open) => {
          if (!open) setConflictPublishMessage(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reemplazar cuestionario publicado
            </AlertDialogTitle>
            <AlertDialogDescription>
              {conflictPublishMessage} ¿Deseas publicar esta versión e inactivar
              la versión activa anterior?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publicarMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={publicarMutation.isPending}
              onClick={() => void handlePublicar(true)}
            >
              {publicarMutation.isPending
                ? "Publicando…"
                : "Reemplazar y publicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  )
}

export function CuestionarioBuilderPage({
  cuestionarioId,
}: Readonly<CuestionarioBuilderPageProps>) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = isAdminUser(user?.roles)

  const detailQuery = useQuery({
    ...cuestionarioQueries.detail(cuestionarioId),
    enabled: Boolean(cuestionarioId),
  })

  if (detailQuery.isLoading) {
    return (
      <PageShell size="xl" padding="default" layout="scroll">
        <div aria-busy="true">
          <ListSkeleton rows={5} rowClassName="h-20 rounded-xl" />
        </div>
      </PageShell>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <PageShell size="xl" padding="default" layout="scroll">
        <EmptyState
          bordered
          icon={<AlertCircle className="size-6 text-destructive" />}
          title="Error al cargar el cuestionario"
          description={getErrorMessage(detailQuery.error)}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link to={routes.cuestionarios.root} />}
              >
                Volver
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void detailQuery.refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                Reintentar
              </Button>
            </div>
          }
        />
      </PageShell>
    )
  }

  return (
    <CuestionarioBuilderEditor
      key={`${detailQuery.data.id}-${detailQuery.data.updatedAt}-${detailQuery.data.preguntas.length}`}
      cuestionario={detailQuery.data}
      isAdmin={isAdmin}
    />
  )
}
