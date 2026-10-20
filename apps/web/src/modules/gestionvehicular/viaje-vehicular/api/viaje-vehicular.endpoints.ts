export const viajeVehicularEndpoints = {
  root: "/viajes-vehiculares",
  byId: (id: string) => `/viajes-vehiculares/${id}`,
  byAsignacion: (asignacionId: string) =>
    `/viajes-vehiculares/asignacion/${asignacionId}`,
  bySolicitud: (solicitudId: string) =>
    `/viajes-vehiculares/solicitud/${solicitudId}`,
  exportarExcel: "/viajes-vehiculares/exportar-excel",
}

