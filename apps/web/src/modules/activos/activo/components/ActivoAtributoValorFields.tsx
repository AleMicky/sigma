import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import { RequiredFieldLabel } from "@/shared/components/form-dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

type ActivoAtributoValorFieldsProps = {
  atributos: ActivoAtributo[]
  tiposDatoById: Map<string, TipoDato>
  valores: Record<string, string>
  errors: Record<string, string>
  onChange: (atributoId: string, value: string) => void
  disabled?: boolean
}

export function ActivoAtributoValorFields({
  atributos,
  tiposDatoById,
  valores,
  errors,
  onChange,
  disabled = false,
}: ActivoAtributoValorFieldsProps) {
  if (atributos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Este tipo de activo no tiene atributos configurados.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      {atributos.map((atributo) => {
        const tipoDato = tiposDatoById.get(atributo.tipoDatoId)
        const codigo = (tipoDato?.codigo ?? "TEXT").toUpperCase()
        const value = valores[atributo.id] ?? ""
        const error = errors[atributo.id]
        const fieldDisabled = disabled || !atributo.editable
        const label = atributo.etiqueta
        const fieldId = `atributo-${atributo.id}`

        return (
          <Field key={atributo.id} data-invalid={error ? true : undefined}>
            {atributo.requerido ? (
              <RequiredFieldLabel htmlFor={fieldId}>{label}</RequiredFieldLabel>
            ) : (
              <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
            )}

            {atributo.descripcion ? (
              <p className="text-xs text-muted-foreground">
                {atributo.descripcion}
              </p>
            ) : null}

            <AtributoInput
              atributo={atributo}
              codigo={codigo}
              fieldId={fieldId}
              value={value}
              disabled={fieldDisabled}
              invalid={Boolean(error)}
              onChange={(next) => onChange(atributo.id, next)}
            />

            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        )
      })}
    </div>
  )
}

type AtributoInputProps = {
  atributo: ActivoAtributo
  codigo: string
  fieldId: string
  value: string
  disabled: boolean
  invalid: boolean
  onChange: (value: string) => void
}

function AtributoInput({
  atributo,
  codigo,
  fieldId,
  value,
  disabled,
  invalid,
  onChange,
}: AtributoInputProps) {
  if (codigo === "TEXTAREA") {
    return (
      <Textarea
        id={fieldId}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (codigo === "NUMBER" || codigo === "DECIMAL") {
    return (
      <Input
        id={fieldId}
        type="number"
        step={codigo === "DECIMAL" ? "any" : "1"}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (codigo === "DATE") {
    return (
      <Input
        id={fieldId}
        type="date"
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (codigo === "DATETIME") {
    return (
      <Input
        id={fieldId}
        type="datetime-local"
        value={toDatetimeLocal(value)}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(fromDatetimeLocal(e.target.value))}
      />
    )
  }

  if (codigo === "BOOLEAN") {
    return (
      <Select
        value={value || null}
        disabled={disabled}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger id={fieldId} aria-invalid={invalid} className="w-full">
          <SelectValue placeholder="Selecciona…">
            {value === "true" ? "Sí" : value === "false" ? "No" : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Sí</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  if (codigo === "SELECT") {
    const opciones = atributo.opciones ?? []
    const selected = opciones.find(
      (opcion) => opcion.value.toLowerCase() === value.toLowerCase(),
    )

    return (
      <Select
        value={value || null}
        disabled={disabled}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger id={fieldId} aria-invalid={invalid} className="w-full">
          <SelectValue placeholder="Selecciona…">
            {selected?.label ?? null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {opciones.map((opcion) => (
            <SelectItem key={opcion.value} value={opcion.value}>
              {opcion.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (codigo === "MULTISELECT") {
    const opciones = atributo.opciones ?? []
    const selected = parseMultiselect(value)

    return (
      <div className="flex flex-col gap-2 rounded-md border border-border p-3">
        {opciones.map((opcion) => {
          const checked = selected.some(
            (item) => item.toLowerCase() === opcion.value.toLowerCase(),
          )

          return (
            <label
              key={opcion.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={checked}
                disabled={disabled}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opcion.value]
                    : selected.filter(
                        (item) =>
                          item.toLowerCase() !== opcion.value.toLowerCase(),
                      )
                  onChange(JSON.stringify(next))
                }}
              />
              {opcion.label}
            </label>
          )
        })}
      </div>
    )
  }

  return (
    <Input
      id={fieldId}
      value={value}
      disabled={disabled}
      aria-invalid={invalid}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function parseMultiselect(value: string): string[] {
  if (!value.trim()) return []
  try {
    const parsed = JSON.parse(value) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

function toDatetimeLocal(value: string): string {
  if (!value) return ""
  if (value.includes("T") && value.length >= 16) {
    return value.slice(0, 16)
  }
  return value
}

function fromDatetimeLocal(value: string): string {
  if (!value) return ""
  return value.length === 16 ? `${value}:00` : value
}
