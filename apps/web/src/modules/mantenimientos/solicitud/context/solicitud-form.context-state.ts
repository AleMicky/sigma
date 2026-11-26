import * as React from "react"

import type { UseSolicitudFormReturn } from "../hooks/use-solicitud-form"

export const SolicitudFormContext = React.createContext<UseSolicitudFormReturn | null>(
  null,
)

export function useSolicitudFormContext(): UseSolicitudFormReturn {
  const context = React.useContext(SolicitudFormContext)
  if (!context) {
    throw new Error(
      "useSolicitudFormContext debe utilizarse dentro de un <SolicitudFormProvider>",
    )
  }
  return context
}
