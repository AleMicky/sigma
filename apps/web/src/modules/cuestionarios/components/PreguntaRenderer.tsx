import { useState, type KeyboardEvent } from "react"
import { Check, Star } from "lucide-react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { cn } from "@/shared/lib/utils"

import type { PreguntaCuestionario } from "../api/cuestionario.types"
import type { RespuestaDraftValue } from "../lib/cuestionario.utils"

export type PreguntaRendererProps = {
  pregunta: PreguntaCuestionario
  index: number
  value?: RespuestaDraftValue
  onChange?: (next: RespuestaDraftValue) => void
  readOnly?: boolean
  error?: string
  idPrefix?: string
}

function getScaleLabels(configJson: Record<string, unknown> | null): {
  minLabel: string
  maxLabel: string
} {
  const minLabel =
    typeof configJson?.minLabel === "string" && configJson.minLabel.trim()
      ? configJson.minLabel.trim()
      : "Muy deficiente"
  const maxLabel =
    typeof configJson?.maxLabel === "string" && configJson.maxLabel.trim()
      ? configJson.maxLabel.trim()
      : "Excelente"
  return { minLabel, maxLabel }
}

const FIVE_LEVELS = [1, 2, 3, 4, 5] as const

export function PreguntaRenderer({
  pregunta,
  index,
  value,
  onChange,
  readOnly = false,
  error,
  idPrefix = "pregunta",
}: Readonly<PreguntaRendererProps>) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const fieldId = `${idPrefix}-${pregunta.id}`
  const helpId = pregunta.descripcionAyuda ? `${fieldId}-help` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy =
    [helpId, errorId].filter(Boolean).join(" ") || undefined
  const isInvalid = Boolean(error)

  const activeOpciones = [...(pregunta.opciones ?? [])]
    .filter((opt) => opt.activo !== false)
    .sort((a, b) => a.orden - b.orden)

  const handleRadioArrowKey = (
    event: KeyboardEvent<HTMLElement>,
    currentIndex: number,
    total: number,
    onSelectIndex: (nextIndex: number) => void,
  ) => {
    if (readOnly) return
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      onSelectIndex((currentIndex + 1) % total)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      onSelectIndex((currentIndex - 1 + total) % total)
    }
  }

  const numericValue =
    value?.valorNumerico !== undefined && value.valorNumerico !== ""
      ? Number(value.valorNumerico)
      : null

  const { minLabel, maxLabel } = getScaleLabels(pregunta.configJson)

  return (
    <Field
      data-invalid={isInvalid}
      className={cn(
        "rounded-xl border border-border/80 bg-card p-4 transition-colors",
        isInvalid && "border-destructive/60 bg-destructive/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <FieldLabel
          htmlFor={
            pregunta.tipoPregunta === "TEXTO_CORTO" ||
            pregunta.tipoPregunta === "TEXTO_LARGO" ||
            pregunta.tipoPregunta === "NUMERICO"
              ? fieldId
              : undefined
          }
          id={`${fieldId}-label`}
          className="flex flex-wrap items-baseline gap-1.5 text-sm font-medium text-foreground"
        >
          <span className="font-mono text-xs font-semibold text-primary">
            {index + 1}.
          </span>
          <span>{pregunta.enunciado}</span>
          {pregunta.obligatoria ? (
            <span className="text-destructive" aria-hidden>
              *
            </span>
          ) : (
            <span className="text-xs font-normal text-muted-foreground">
              (Opcional)
            </span>
          )}
        </FieldLabel>
      </div>

      {pregunta.descripcionAyuda ? (
        <FieldDescription id={helpId} className="text-xs">
          {pregunta.descripcionAyuda}
        </FieldDescription>
      ) : null}

      <div className="pt-1">
        {pregunta.tipoPregunta === "ESTRELLAS_1_5" ? (
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="radiogroup"
              aria-labelledby={`${fieldId}-label`}
              aria-describedby={describedBy}
              aria-required={pregunta.obligatoria}
              aria-invalid={isInvalid}
              className="inline-flex items-center gap-1"
              onMouseLeave={() => setHoveredStar(null)}
            >
              {FIVE_LEVELS.map((star, starIdx) => {
                const selected = numericValue === star
                const filled =
                  hoveredStar !== null && !readOnly
                    ? star <= hoveredStar
                    : numericValue !== null && star <= numericValue
                const isFocusable =
                  numericValue === null ? star === 1 : selected

                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"} de 5`}
                    tabIndex={readOnly ? -1 : isFocusable ? 0 : -1}
                    disabled={readOnly}
                    onMouseEnter={() => {
                      if (!readOnly) setHoveredStar(star)
                    }}
                    onClick={() => {
                      if (!readOnly) {
                        onChange?.({ valorNumerico: String(star) })
                      }
                    }}
                    onKeyDown={(event) =>
                      handleRadioArrowKey(
                        event,
                        starIdx,
                        FIVE_LEVELS.length,
                        (nextIdx) => {
                          const nextVal = FIVE_LEVELS[nextIdx]
                          onChange?.({ valorNumerico: String(nextVal) })
                        },
                      )
                    }
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      filled
                        ? "border-warning/40 bg-warning/10 text-warning"
                        : "border-border/70 bg-background text-muted-foreground/50 hover:border-warning/40 hover:text-warning/80",
                      readOnly && "cursor-default opacity-90",
                    )}
                  >
                    <Star
                      className={cn(
                        "size-5 transition-transform",
                        filled && "fill-current",
                      )}
                    />
                  </button>
                )
              })}
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {numericValue !== null
                ? `${numericValue} / 5 estrellas`
                : readOnly
                  ? "Sin respuesta"
                  : "Selecciona una calificación"}
            </span>
          </div>
        ) : null}

        {pregunta.tipoPregunta === "ESCALA_1_5" ? (
          <div className="space-y-1.5">
            <div
              role="radiogroup"
              aria-labelledby={`${fieldId}-label`}
              aria-describedby={describedBy}
              aria-required={pregunta.obligatoria}
              aria-invalid={isInvalid}
              className="grid grid-cols-5 gap-2"
            >
              {FIVE_LEVELS.map((level, levelIdx) => {
                const selected = numericValue === level
                const isFocusable =
                  numericValue === null ? level === 1 : selected

                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`Nivel ${level} de 5`}
                    tabIndex={readOnly ? -1 : isFocusable ? 0 : -1}
                    disabled={readOnly}
                    onClick={() => {
                      if (!readOnly) {
                        onChange?.({ valorNumerico: String(level) })
                      }
                    }}
                    onKeyDown={(event) =>
                      handleRadioArrowKey(
                        event,
                        levelIdx,
                        FIVE_LEVELS.length,
                        (nextIdx) => {
                          onChange?.({
                            valorNumerico: String(FIVE_LEVELS[nextIdx]),
                          })
                        },
                      )
                    }
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border text-sm font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                        : "border-border bg-background text-foreground hover:bg-muted/60",
                      readOnly && "cursor-default opacity-90",
                    )}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>1 · {minLabel}</span>
              <span>5 · {maxLabel}</span>
            </div>
          </div>
        ) : null}

        {pregunta.tipoPregunta === "SI_NO" ? (
          <div
            role="radiogroup"
            aria-labelledby={`${fieldId}-label`}
            aria-describedby={describedBy}
            aria-required={pregunta.obligatoria}
            aria-invalid={isInvalid}
            className="grid max-w-xs grid-cols-2 gap-2"
          >
            {[
              { label: "Sí", val: true },
              { label: "No", val: false },
            ].map((item, idx) => {
              const selected = value?.valorBooleano === item.val
              const isFocusable =
                value?.valorBooleano === undefined ||
                value?.valorBooleano === null
                  ? idx === 0
                  : selected

              return (
                <button
                  key={item.label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={readOnly ? -1 : isFocusable ? 0 : -1}
                  disabled={readOnly}
                  onClick={() => {
                    if (!readOnly) {
                      onChange?.({ valorBooleano: item.val })
                    }
                  }}
                  onKeyDown={(event) =>
                    handleRadioArrowKey(event, idx, 2, (nextIdx) => {
                      onChange?.({ valorBooleano: nextIdx === 0 })
                    })
                  }
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? item.val
                        ? "border-success/40 bg-success/15 text-success"
                        : "border-destructive/40 bg-destructive/15 text-destructive"
                      : "border-border bg-background text-foreground hover:bg-muted/60",
                    readOnly && "cursor-default opacity-90",
                  )}
                >
                  {selected ? <Check className="size-3.5" /> : null}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        ) : null}

        {pregunta.tipoPregunta === "OPCION_UNICA" ? (
          <div
            role="radiogroup"
            aria-labelledby={`${fieldId}-label`}
            aria-describedby={describedBy}
            aria-required={pregunta.obligatoria}
            aria-invalid={isInvalid}
            className="flex flex-col gap-2"
          >
            {activeOpciones.map((opcion, optIdx) => {
              const selected = value?.opcionId === opcion.id
              const isFocusable = !value?.opcionId ? optIdx === 0 : selected

              return (
                <button
                  key={opcion.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={readOnly ? -1 : isFocusable ? 0 : -1}
                  disabled={readOnly}
                  onClick={() => {
                    if (!readOnly) {
                      onChange?.({ opcionId: opcion.id })
                    }
                  }}
                  onKeyDown={(event) =>
                    handleRadioArrowKey(
                      event,
                      optIdx,
                      activeOpciones.length,
                      (nextIdx) => {
                        const target = activeOpciones[nextIdx]
                        if (target) onChange?.({ opcionId: target.id })
                      },
                    )
                  }
                  className={cn(
                    "flex min-h-9 w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/50",
                    readOnly && "cursor-default opacity-90",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/50",
                    )}
                  >
                    {selected ? (
                      <span className="size-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>
                  <span className="flex-1">{opcion.etiqueta}</span>
                </button>
              )
            })}
          </div>
        ) : null}

        {pregunta.tipoPregunta === "OPCION_MULTIPLE" ? (
          <div
            role="group"
            aria-labelledby={`${fieldId}-label`}
            aria-describedby={describedBy}
            aria-invalid={isInvalid}
            className="flex flex-col gap-2"
          >
            {activeOpciones.map((opcion) => {
              const selectedIds = value?.opcionesIds ?? []
              const checked = selectedIds.includes(opcion.id)
              const optionInputId = `${fieldId}-opt-${opcion.id}`

              return (
                <label
                  key={opcion.id}
                  htmlFor={optionInputId}
                  className={cn(
                    "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                    checked
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted/50",
                    readOnly && "cursor-default opacity-90",
                  )}
                >
                  <input
                    id={optionInputId}
                    type="checkbox"
                    checked={checked}
                    disabled={readOnly}
                    onChange={(event) => {
                      if (readOnly) return
                      const nextIds = event.target.checked
                        ? [...selectedIds, opcion.id]
                        : selectedIds.filter((id) => id !== opcion.id)
                      onChange?.({ opcionesIds: nextIds })
                    }}
                    className="size-4 rounded border-input accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="flex-1">{opcion.etiqueta}</span>
                </label>
              )
            })}
          </div>
        ) : null}

        {pregunta.tipoPregunta === "TEXTO_CORTO" ? (
          <Input
            id={fieldId}
            value={value?.valorTexto ?? ""}
            disabled={readOnly}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            placeholder={
              readOnly ? "Sin respuesta" : "Escribe tu respuesta…"
            }
            onChange={(event) =>
              onChange?.({ valorTexto: event.target.value })
            }
            className="h-9 rounded-lg"
          />
        ) : null}

        {pregunta.tipoPregunta === "TEXTO_LARGO" ? (
          <Textarea
            id={fieldId}
            value={value?.valorTexto ?? ""}
            disabled={readOnly}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            rows={3}
            placeholder={
              readOnly ? "Sin respuesta" : "Escribe tu comentario o detalle…"
            }
            onChange={(event) =>
              onChange?.({ valorTexto: event.target.value })
            }
            className="rounded-lg"
          />
        ) : null}

        {pregunta.tipoPregunta === "NUMERICO" ? (
          <Input
            id={fieldId}
            type="number"
            step="any"
            value={value?.valorNumerico ?? ""}
            disabled={readOnly}
            aria-invalid={isInvalid}
            aria-describedby={describedBy}
            placeholder={readOnly ? "Sin respuesta" : "0"}
            onChange={(event) =>
              onChange?.({ valorNumerico: event.target.value })
            }
            className="h-9 max-w-xs rounded-lg tabular-nums"
          />
        ) : null}
      </div>

      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  )
}
