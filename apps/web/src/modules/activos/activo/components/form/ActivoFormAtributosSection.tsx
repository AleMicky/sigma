import { Sliders, Tags } from "lucide-react"

import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import { getErrorMessage } from "@/shared/api"
import { ListSkeleton } from "@/shared/components/list-skeleton"

import { ActivoAtributoValorFields } from "../ActivoAtributoValorFields"

type ActivoFormAtributosSectionProps = {
  tipoActivoId: string
  selectedTipo?: TipoActivo
  atributosVisibles: ActivoAtributo[]
  tiposDatoById: Map<string, TipoDato>
  valores: Record<string, string>
  atributoErrors: Record<string, string>
  isLoading: boolean
  isError: boolean
  error: unknown
  onChange: (atributoId: string, value: string) => void
}

export function ActivoFormAtributosSection({
  tipoActivoId,
  selectedTipo,
  atributosVisibles,
  tiposDatoById,
  valores,
  atributoErrors,
  isLoading,
  isError,
  error,
  onChange,
}: ActivoFormAtributosSectionProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2.5">
          <Sliders className="size-4 text-primary" />
          <h2 className="font-heading font-semibold text-base">
            Atributos Dinámicos
          </h2>
        </div>
        {selectedTipo ? (
          <span className="text-xs text-muted-foreground">
            {atributosVisibles.length} atributo(s)
          </span>
        ) : null}
      </div>

      {!tipoActivoId ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <Tags className="size-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Selecciona un tipo de activo
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Los atributos personalizados se cargan según el tipo seleccionado
            arriba.
          </p>
        </div>
      ) : isLoading ? (
        <ListSkeleton rows={3} rowClassName="h-14 rounded-xl" />
      ) : isError ? (
        <p className="text-sm text-destructive" role="alert">
          {getErrorMessage(error)}
        </p>
      ) : (
        <ActivoAtributoValorFields
          atributos={atributosVisibles}
          tiposDatoById={tiposDatoById}
          valores={valores}
          errors={atributoErrors}
          onChange={onChange}
        />
      )}
    </div>
  )
}
