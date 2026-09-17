import * as React from "react"

import {
  useSolicitudForm,
  type UseSolicitudFormReturn,
} from "../hooks/use-solicitud-form"

const SolicitudFormContext = React.createContext<UseSolicitudFormReturn | null>(null)

export type SolicitudFormProviderProps = {
  solicitudId?: string
  children: React.ReactNode
}

export function SolicitudFormProvider({
  solicitudId,
  children,
}: SolicitudFormProviderProps) {
  const formState = useSolicitudForm({ solicitudId })

  return (
    <SolicitudFormContext.Provider value={formState}>
      {children}
    </SolicitudFormContext.Provider>
  )
}

export function useSolicitudFormContext(): UseSolicitudFormReturn {
  const context = React.useContext(SolicitudFormContext)
  if (!context) {
    throw new Error(
      "useSolicitudFormContext debe utilizarse dentro de un <SolicitudFormProvider>",
    )
  }
  return context
}
