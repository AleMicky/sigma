export const grupoAprobadorDetalleEndpoints = {
  root: (grupoAprobadorId: string) =>
    `/api/v1/grupos-aprobadores/${grupoAprobadorId}/detalles`,
  byId: (grupoAprobadorId: string, id: string) =>
    `/api/v1/grupos-aprobadores/${grupoAprobadorId}/detalles/${id}`,
}
