import * as React from "react"

import {
  useSolicitudVehicularForm,
  type UseSolicitudVehicularFormReturn,
} from "../hooks/use-solicitud-vehicular-form"

const SolicitudVehicularFormContext =
  React.createContext<UseSolicitudVehicularFormReturn | null>(null)

export type SolicitudVehicularFormProviderProps = {
  solicitudId?: string
  children: React.ReactNode
}

export function SolicitudVehicularFormProvider({
  solicitudId,
  children,
}: SolicitudVehicularFormProviderProps) {
  const formState = useSolicitudVehicularForm({ solicitudId })

  return (
    <SolicitudVehicularFormContext.Provider value={formState}>
      {children}
    </SolicitudVehicularFormContext.Provider>
  )
}

export function useSolicitudVehicularFormContext(): UseSolicitudVehicularFormReturn {
  const context = React.useContext(SolicitudVehicularFormContext)
  if (!context) {
    throw new Error(
      "useSolicitudVehicularFormContext debe utilizarse dentro de un <SolicitudVehicularFormProvider>"
    )
  }
  return context
}
