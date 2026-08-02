export const routes = {
  home: "/",
  login: "/login",
  perfil: "/perfil",

  activos: {
    root: "/activos",
  },

  tiposActivo: {
    root: "/tipos-activo",
    atributos: "/tipos-activo/atributos",
    historial: "/tipos-activo/historial",
  },

  parametros: {
    root: "/parametros",
    gestion: "/parametros/gestion",
    catalogos: "/parametros/catalogos",
    tiposDato: "/parametros/tipos-dato",
  },
} as const
