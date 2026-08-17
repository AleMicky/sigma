export const routes = {
  home: "/",
  login: "/login",
  perfil: "/perfil",

  activos: {
    root: "/activos",
    nuevo: "/activos/nuevo",
    catalogo: "/activos/catalogo",
    consultaDocumentos: "/activos/consulta-documentos",
    detail: (activoId: string) => `/activos/catalogo/${activoId}`,
    editar: (activoId: string) => `/activos/${activoId}/editar`,
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

  categorias: {
    root: "/categorias",
  },

  accesorios: {
    root: "/accesorios",
  },

  tiposDocumento: {
    root: "/tipos-documento",
  },

  parametros: {
    root: "/parametros",
    gestion: "/parametros/gestion",
    catalogos: "/parametros/catalogos",
    tiposDato: "/parametros/tipos-dato",
    ubicaciones: "/parametros/ubicaciones",
    unidadesMedida: "/parametros/unidades-medida",
  },

  organizacion: {
    root: "/organizacion",
    empleados: "/organizacion/empleados",
    areas: "/organizacion/areas",
    cargos: "/organizacion/cargos",
    personas: "/organizacion/personas",
    migraciones: "/organizacion/migraciones",
  },

  inventarios: {
    root: "/inventarios",
    nuevo: "/inventarios/nuevo",
    editar: (insumoId: string) => `/inventarios/${insumoId}/editar`,
    tiposInsumo: {
      root: "/inventarios/tipos-insumo",
      detail: (tipoInsumoId: string) => `/inventarios/tipos-insumo/${tipoInsumoId}`,
      atributos: (tipoInsumoId: string) =>
        `/inventarios/tipos-insumo/${tipoInsumoId}/atributos`,
    },
    categorias: {
      root: "/inventarios/categorias",
    },
  },

  mantenimientos: {
    root: "/mantenimientos",
    solicitudes: "/mantenimientos/solicitudes",
    actividades: "/mantenimientos/actividades",
    checklists: "/mantenimientos/checklists",
    tiposMantenimiento: "/mantenimientos/tipos-mantenimiento",
    prioridades: "/mantenimientos/prioridades",
  },
} as const

