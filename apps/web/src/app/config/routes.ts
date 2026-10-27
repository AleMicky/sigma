export const routes = {
  home: "/",
  login: "/login",
  perfil: "/perfil",

  activos: {
    root: "/activos",
    listarActivos: "/activos/registro-activo",
    nuevo: "/activos/registro-activo/nuevo",
    catalogo: "/activos/catalogo",
    consultaDocumentos: "/activos/consulta-documentos",
    disponibilidad: "/activos/disponibilidad",
    detail: (activoId: string) => `/activos/catalogo/${activoId}`,
    editar: (activoId: string) =>
      `/activos/registro-activo/${activoId}/editar`,
    configuraciones: {
      root: "/activos/configuraciones",
      tiposActivo: "/activos/configuraciones/tipos-activo",
      categorias: "/activos/configuraciones/categorias-activos",
      accesorios: "/activos/configuraciones/accesorios",
      tiposDocumento: "/activos/configuraciones/tipos-documento",
      estadosOperativos: "/activos/configuraciones/estados-operativos",
    },
  },

  tiposActivo: {
    root: "/activos/configuraciones/tipos-activo",
  },

  categorias: {
    root: "/activos/configuraciones/categorias-activos",
  },

  accesorios: {
    root: "/activos/configuraciones/accesorios",
  },

  tiposDocumento: {
    root: "/activos/configuraciones/tipos-documento",
  },

  estadosOperativos: {
    root: "/activos/configuraciones/estados-operativos",
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
    responsabilidades: "/organizacion/responsabilidades",
    gruposAprobadores: "/organizacion/grupos-aprobadores",
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
    aprobaciones: "/mantenimientos/aprobaciones",
    encargado: "/mantenimientos/encargado",
    supervisor: "/mantenimientos/supervisor",
    nuevaSolicitud: "/mantenimientos/solicitudes/nueva",
    editarSolicitud: (solicitudId: string) =>
      `/mantenimientos/solicitudes/${solicitudId}/editar`,
    actividades: "/mantenimientos/actividades",
    planesMantenimiento: "/mantenimientos/planes-mantenimiento",
    tiposMantenimiento: "/mantenimientos/tipos-mantenimiento",
    prioridades: "/mantenimientos/prioridades",
    controlesActivos: {
      root: "/mantenimientos/controles-activos",
      nuevo: "/mantenimientos/controles-activos/nuevo",
    },
    ordenesTrabajo: {
      root: "/mantenimientos/ordenes-trabajo",
      nuevo: "/mantenimientos/ordenes-trabajo/nuevo",
    },
  },

  seguridad: {
    root: "/seguridad",
    usuarios: "/seguridad/usuarios",
    roles: "/seguridad/roles",
    menus: "/seguridad/menus",
  },

  gestionVehicular: {
    root: "/gestion-vehicular",
    dashboard: "/gestion-vehicular/dashboard-gestion-vehicular",
    solicitudes: "/gestion-vehicular/solicitudes",
    asignaciones: "/gestion-vehicular/asignaciones",
    nuevaSolicitud: "/gestion-vehicular/solicitudes/nueva",
    editarSolicitud: (solicitudId: string) =>
      `/gestion-vehicular/solicitudes/${solicitudId}/editar`,
    salidas: "/gestion-vehicular/salidas",
    salidaDetalle: (id: string) => `/gestion-vehicular/salidas/${id}`,
    misViajes: "/gestion-vehicular/mis-viajes",
    calendarioReservas: "/gestion-vehicular/calendario-reservas",
    controlesActivos: {
      nuevo: "/gestion-vehicular/controles-activos/nuevo",
    },
    configuraciones: {
      root: "/gestion-vehicular/configuraciones",
      conductores: "/gestion-vehicular/configuraciones/conductores",
      flotas: "/gestion-vehicular/configuraciones/flotas",
      tiposSolicitud: "/gestion-vehicular/configuraciones/tipos-solicitud",
    },
    reportes: {
      root: "/gestion-vehicular/reportes",
      bitacora: "/gestion-vehicular/reportes/bitacora",
      consumoCombustible: "/gestion-vehicular/reportes/consumo-combustible",
      historialViajes: "/gestion-vehicular/reportes/historial-viajes",
      salidasVehiculares: "/gestion-vehicular/reportes/salidas-vehiculares",
    },
  },
} as const

