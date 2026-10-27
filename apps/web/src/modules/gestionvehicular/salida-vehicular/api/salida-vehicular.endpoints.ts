export const salidaVehicularEndpoints = {
  root: "/salidas-vehiculares",
  activas: "/salidas-vehiculares/activas",
  misSalidas: "/salidas-vehiculares/mis-salidas",
  byId: (id: string) => `/salidas-vehiculares/${id}`,
  cancelar: (id: string) => `/salidas-vehiculares/${id}/cancelar`,

  // Flowable
  tareaActual: (id: string) => `/salidas-vehiculares/${id}/tarea-actual`,
  acciones: (id: string) => `/salidas-vehiculares/${id}/acciones`,
  ejecutarAccion: (id: string, accionId: string) =>
    `/salidas-vehiculares/${id}/acciones/${encodeURIComponent(accionId)}/ejecutar`,
  historialProceso: (id: string) => `/salidas-vehiculares/${id}/historial-proceso`,

  // Eventos
  eventos: (id: string) => `/salidas-vehiculares/${id}/eventos`,
  eventoById: (id: string, eventoId: string) =>
    `/salidas-vehiculares/${id}/eventos/${eventoId}`,

  // Bitácoras
  bitacoras: (id: string) => `/salidas-vehiculares/${id}/bitacoras`,
  bitacoraById: (id: string, bitacoraId: string) =>
    `/salidas-vehiculares/${id}/bitacoras/${bitacoraId}`,

  // Reportes
  reportes: {
    general: "/reportes/salidas-vehiculares",
    vehiculos: "/reportes/salidas-vehiculares/vehiculos",
    empleados: "/reportes/salidas-vehiculares/empleados",
    tiempos: "/reportes/salidas-vehiculares/tiempos",
    bitacoras: "/reportes/salidas-vehiculares/bitacoras",
  },
} as const
