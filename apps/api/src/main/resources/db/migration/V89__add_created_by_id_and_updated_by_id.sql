-- ============================================================================
-- Migración: V89__add_created_by_id_and_updated_by_id.sql
-- Descripción: Agregar columnas created_by_id y updated_by_id (UUID) a todas
--              las tablas que implementan auditoría en el sistema.
-- ============================================================================

-- Módulo: Parámetros
ALTER TABLE parametros.tipos_dato ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.tipos_dato ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.catalogos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.catalogos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.catalogo_items ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.catalogo_items ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.gestiones ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.gestiones ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.periodos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.periodos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.ubicaciones ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.ubicaciones ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE parametros.unidades_medida ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE parametros.unidades_medida ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Activos
ALTER TABLE activos.tipos_activo ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.tipos_activo ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.categorias ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.categorias ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.tipos_documento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.tipos_documento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.documentos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.documentos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.componentes ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.componentes ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activo_atributos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activo_atributos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activo_atributo_valores ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activo_atributo_valores ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activo_documento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activo_documento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activo_asignaciones ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activo_asignaciones ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.accesorios ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.accesorios ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE activos.activo_accesorios ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE activos.activo_accesorios ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Organización
ALTER TABLE organizacion.personas ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.personas ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.areas ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.areas ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.cargos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.cargos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.empleados ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.empleados ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.responsabilidades ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.responsabilidades ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.grupos_aprobadores ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.grupos_aprobadores ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.grupos_aprobadores_detalles ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.grupos_aprobadores_detalles ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.grupos_aprobadores_dependientes ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.grupos_aprobadores_dependientes ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE organizacion.empleados_responsabilidades ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE organizacion.empleados_responsabilidades ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Inventarios
ALTER TABLE inventarios.categorias_insumo ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE inventarios.categorias_insumo ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE inventarios.tipos_insumo ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE inventarios.tipos_insumo ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE inventarios.tipo_insumo_atributos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE inventarios.tipo_insumo_atributos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE inventarios.insumos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE inventarios.insumos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE inventarios.insumo_atributo_valores ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE inventarios.insumo_atributo_valores ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Mantenimientos
ALTER TABLE mantenimientos.tipos_mantenimiento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.tipos_mantenimiento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.prioridades ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.prioridades ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.solicitudes_mantenimiento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.solicitudes_mantenimiento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.solicitud_mantenimiento_adjuntos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.solicitud_mantenimiento_adjuntos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.actividades_mantenimiento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.actividades_mantenimiento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.actividad_mantenimiento_aplicaciones ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.actividad_mantenimiento_aplicaciones ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.checklists_mantenimiento ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.checklists_mantenimiento ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.checklist_items ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.checklist_items ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.control_activo ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.control_activo ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.control_activo_detalle ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.control_activo_detalle ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.orden_trabajo ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.orden_trabajo ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.orden_trabajo_actividades ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.orden_trabajo_actividades ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.orden_trabajo_actividad_evidencias ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.orden_trabajo_actividad_evidencias ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE mantenimientos.orden_trabajo_adjuntos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE mantenimientos.orden_trabajo_adjuntos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Seguridad
ALTER TABLE seguridad.roles ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.roles ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE seguridad.usuarios ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.usuarios ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE seguridad.usuarios_roles ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.usuarios_roles ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE seguridad.menus ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.menus ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE seguridad.roles_menus ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.roles_menus ADD COLUMN IF NOT EXISTS updated_by_id UUID;

ALTER TABLE seguridad.permisos ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE seguridad.permisos ADD COLUMN IF NOT EXISTS updated_by_id UUID;

-- Módulo: Workflow
ALTER TABLE workflow.workflows ADD COLUMN IF NOT EXISTS created_by_id UUID;
ALTER TABLE workflow.workflows ADD COLUMN IF NOT EXISTS updated_by_id UUID;
