export const cargaCombustibleEndpoints = {
  root: "/cargas-combustible",
  byId: (id: string) => `/cargas-combustible/${id}`,
  byActivo: (activoId: string) => `/cargas-combustible/activo/${activoId}`,
  byViaje: (viajeId: string) => `/cargas-combustible/viaje/${viajeId}`,
  exportarExcel: "/cargas-combustible/exportar-excel",
}
