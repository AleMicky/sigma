export const empleadoResponsabilidadEndpoints = {
  root: "/empleado-responsabilidades",
  byId: (id: string) => `/empleado-responsabilidades/${id}`,
  byResponsabilidadCodigo: (codigo: string) =>
    `/empleado-responsabilidades/responsabilidades/${codigo}/empleados`,
}
