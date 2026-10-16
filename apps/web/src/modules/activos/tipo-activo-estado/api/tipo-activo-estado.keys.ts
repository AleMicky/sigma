import { createResourceKeys } from "@/shared/api"

import type { TipoActivoEstadoFilters } from "./tipo-activo-estado.service"

export const tipoActivoEstadoKeys = createResourceKeys<
  "tipos-activo-estados",
  TipoActivoEstadoFilters
>("tipos-activo-estados")
