export const incidenteEndpoints = {
  root: "/incidentes",
  byId: (id: string) => `/incidentes/${id}`,
  byActivoId: (activoId: string) => `/incidentes/activo/${activoId}`,
  cancelar: (id: string) => `/incidentes/${id}/cancelar`,

  // Flowable BPMN
  tareaActual: (id: string) => `/incidentes/${id}/tarea-actual`,
  acciones: (id: string) => `/incidentes/${id}/acciones`,
  ejecutarAccion: (id: string, accionId: string) =>
    `/incidentes/${id}/acciones/${encodeURIComponent(accionId)}/ejecutar`,
  historialProceso: (id: string) => `/incidentes/${id}/historial-proceso`,

  // Involucrados
  involucrados: (id: string) => `/incidentes/${id}/involucrados`,
  involucradoById: (id: string, involucradoId: string) =>
    `/incidentes/${id}/involucrados/${involucradoId}`,

  // Evidencias
  evidencias: (id: string) => `/incidentes/${id}/evidencias`,
  evidenciaById: (id: string, evidenciaId: string) =>
    `/incidentes/${id}/evidencias/${evidenciaId}`,
} as const

