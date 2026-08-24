export const grupoAprobadorDependienteEndpoints = {
  root: (grupoAprobadorId: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/dependientes`,
  byId: (grupoAprobadorId: string, id: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/dependientes/${id}`,
  aprobadoresSelect: (empleadoId: string) =>
    `/grupos-aprobadores/empleados/${empleadoId}/aprobadores/select`,
}

