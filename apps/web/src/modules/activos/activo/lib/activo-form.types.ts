import { useForm } from "@tanstack/react-form"

import {
  activoSchema,
  defaultActivoValues,
} from "../schemas/activo.schema"

/**
 * Helper solo para inferir el tipo exacto que devuelve `useForm` con la
 * configuración del formulario de activos. Nunca se ejecuta; el hook real
 * se crea en `ActivoFormPage`.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useActivoFormShape() {
  return useForm({
    defaultValues: defaultActivoValues,
    validators: { onSubmit: activoSchema },
  })
}

export type ActivoFormApi = ReturnType<typeof useActivoFormShape>
