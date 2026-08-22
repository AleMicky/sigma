export const grupoAprobadorDetalleEndpoints = {
  root: (grupoAprobadorId: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/detalles`,
  byId: (grupoAprobadorId: string, id: string) =>
    `/grupos-aprobadores/${grupoAprobadorId}/detalles/${id}`,
}

