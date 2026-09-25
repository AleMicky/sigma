import { Sliders, Tags } from "lucide-react"

import type { ActivoAtributo } from "@/modules/activos/activo-atributo/api/activo-atributo.service"
import type { TipoActivo } from "@/modules/activos/tipo-activo/api/tipo-activo.service"
import type { TipoDato } from "@/modules/parametros/tipo-dato/api/tipo-dato.service"
import { getErrorMessage } from "@/shared/api"
import { FormSection } from "@/shared/components/form-section"
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
    <FormSection
      step={3}
      title="Especificaciones Técnicas Dinámicas"
      description="Atributos técnicos parametrizados según la tipología del activo seleccionado."
      icon={Sliders}
      badge={
        selectedTipo ? (
          <span className="text-xs text-muted-foreground font-medium">
            {atributosVisibles.length} atributo(s)
          </span>
        ) : null
      }
      columns={1}
    >
      {!tipoActivoId ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <Tags className="size-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            Selecciona un tipo de activo
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Los atributos personalizados se cargarán automáticamente según el tipo
            seleccionado en el Paso 1.
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
    </FormSection>
  )
}
