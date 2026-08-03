export const routes = {
  home: "/",
  login: "/login",
  perfil: "/perfil",

  activos: {
    root: "/activos",
  },

  tiposActivo: {
    root: "/tipos-activo",
    historial: "/tipos-activo/historial",
    detail: (tipoActivoId: string) => `/tipos-activo/${tipoActivoId}`,
    atributos: (tipoActivoId: string) =>
      `/tipos-activo/${tipoActivoId}/atributos`,
    componentes: (tipoActivoId: string) =>
      `/tipos-activo/${tipoActivoId}/componentes`,
  },

  parametros: {
    root: "/parametros",
    gestion: "/parametros/gestion",
    catalogos: "/parametros/catalogos",
    tiposDato: "/parametros/tipos-dato",
  },
} as const
