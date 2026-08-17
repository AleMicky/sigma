import { SlidersHorizontal } from "lucide-react"

import type { TipoInsumoAtributo } from "@/modules/inventarios/tipo-insumo-atributo/api/tipo-insumo-atributo.service"
import { ListSkeleton } from "@/shared/components/list-skeleton"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

type InsumoFormAtributosSectionProps = {
  atributos: TipoInsumoAtributo[]
  tiposDatoById: Map<string, { nombre: string; codigo: string }>
  valores: Record<string, string>
  onChangeValor: (atributoId: string, valor: string) => void
  atributoErrors: Record<string, string>
  isLoading: boolean
  hasTipoSelected: boolean
}

export function InsumoFormAtributosSection({
  atributos,
  tiposDatoById,
  valores,
  onChangeValor,
  atributoErrors,
  isLoading,
  hasTipoSelected,
}: InsumoFormAtributosSectionProps) {
  if (!hasTipoSelected || (!isLoading && atributos.length === 0)) {
    return null
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Especificaciones Técnicas / Atributos Dinámicos
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {atributos.length} {atributos.length === 1 ? "atributo" : "atributos"}
        </span>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} rowClassName="h-10 rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {atributos.map((attr) => {
            const tipoDatoInfo = tiposDatoById.get(attr.tipoDatoId)
            const codigoDato = (tipoDatoInfo?.codigo ?? "").toUpperCase()
            const error = atributoErrors[attr.id]
            const isInvalid = Boolean(error)
            const valor = valores[attr.id] ?? ""

            const isNumber =
              codigoDato.includes("NUM") ||
              codigoDato.includes("DEC") ||
              codigoDato.includes("ENTERO") ||
              codigoDato.includes("INT")
            const isDate =
              codigoDato.includes("FECHA") || codigoDato.includes("DATE")
            const isBoolean =
              codigoDato.includes("BOOL") || codigoDato.includes("LOGICO")

            if (isBoolean) {
              const isChecked = valor === "true" || valor === "1"
              return (
                <Field
                  key={attr.id}
                  data-invalid={isInvalid || undefined}
                  className="flex flex-col justify-center rounded-xl border border-border/60 bg-muted/20 p-3"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        onChangeValor(attr.id, e.target.checked ? "true" : "false")
                      }
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>{attr.nombre}</span>
                    {attr.requerido && (
                      <span className="text-destructive font-bold">*</span>
                    )}
                  </label>
                  {isInvalid && <FieldError errors={[{ message: error }]} />}
                </Field>
              )
            }

            return (
              <Field key={attr.id} data-invalid={isInvalid || undefined}>
                <FieldLabel htmlFor={`attr-${attr.id}`}>
                  {attr.nombre}
                  {attr.requerido && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                  <span className="ml-1 text-[10px] text-muted-foreground font-normal">
                    ({tipoDatoInfo?.nombre ?? "Texto"})
                  </span>
                </FieldLabel>

                <Input
                  id={`attr-${attr.id}`}
                  name={`attr-${attr.id}`}
                  type={isNumber ? "number" : isDate ? "date" : "text"}
                  value={valor}
                  onChange={(e) => onChangeValor(attr.id, e.target.value)}
                  placeholder={`Ingresa ${attr.nombre.toLowerCase()}…`}
                  aria-invalid={isInvalid}
                  required={attr.requerido}
                />
                {isInvalid && <FieldError errors={[{ message: error }]} />}
              </Field>
            )
          })}
        </div>
      )}
    </div>
  )
}
