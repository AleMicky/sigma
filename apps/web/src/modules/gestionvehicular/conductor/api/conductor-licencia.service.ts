import { http } from "@/shared/api"

import { conductorLicenciaEndpoints } from "./conductor.endpoints"
import type { ConductorLicencia, ConductorLicenciaPayload } from "./conductor.service"

export const listLicenciasByConductor = (
  conductorId: string
): Promise<ConductorLicencia[]> => {
  return http.get<ConductorLicencia[]>(
    conductorLicenciaEndpoints.byConductor(conductorId)
  )
}

export const getLicencia = (id: string): Promise<ConductorLicencia> => {
  return http.get<ConductorLicencia>(conductorLicenciaEndpoints.byId(id))
}

export const createLicencia = (
  conductorId: string,
  payload: ConductorLicenciaPayload,
  file?: File | null
): Promise<ConductorLicencia> => {
  if (file) {
    const formData = new FormData()
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )
    formData.append("file", file)
    return http.post<ConductorLicencia>(
      conductorLicenciaEndpoints.byConductor(conductorId),
      formData
    )
  }
  return http.post<ConductorLicencia>(
    conductorLicenciaEndpoints.byConductor(conductorId),
    payload
  )
}

export const updateLicencia = (
  id: string,
  payload: ConductorLicenciaPayload,
  file?: File | null
): Promise<ConductorLicencia> => {
  if (file) {
    const formData = new FormData()
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    )
    formData.append("file", file)
    return http.put<ConductorLicencia>(conductorLicenciaEndpoints.byId(id), formData)
  }
  return http.put<ConductorLicencia>(conductorLicenciaEndpoints.byId(id), payload)
}

export const deleteLicencia = (id: string): Promise<void> => {
  return http.delete<void>(conductorLicenciaEndpoints.byId(id))
}
