export const grupoAprobadorDependienteEndpoints = {
  root: (grupoAprobadorId: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/dependientes`,
  byId: (grupoAprobadorId: string, id: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/dependientes/${id}`,
}
