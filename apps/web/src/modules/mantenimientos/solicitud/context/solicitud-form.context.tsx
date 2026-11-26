import * as React from "react"

import { useSolicitudForm } from "../hooks/use-solicitud-form"
import { SolicitudFormContext } from "./solicitud-form.context-state"

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
