-- ============================================================================
-- Migración: V174__add_missing_foreign_keys_and_indexes.sql
-- Descripción: Agrega las 46 claves foráneas faltantes e índices de soporte
--              en todos los schemas. Se crean con NOT VALID + validación segura
--              para proteger inmediatamente nuevas escrituras sin fallar ante
--              posibles registros históricos huérfanos.
-- ============================================================================

DO $$
DECLARE
    fk RECORD;
BEGIN
    FOR fk IN
        SELECT *
        FROM (VALUES
            -- ── Schema: activos ───────────────────────────────────────────────
            ('activos', 'activo_asignaciones', 'fk_activo_asignaciones_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('activos', 'activo_asignaciones', 'fk_activo_asignaciones_area', 'area_id', 'organizacion.areas', 'id', 'SET NULL'),
            ('activos', 'activo_documento', 'fk_activo_documento_activo', 'activo_id', 'activos.activos', 'id', 'CASCADE'),
            ('activos', 'activo_documento', 'fk_activo_documento_tipo_documento', 'tipo_documento_id', 'activos.tipos_documento', 'id', 'RESTRICT'),
            ('activos', 'activos', 'fk_activos_ubicacion', 'ubicacion_id', 'parametros.ubicaciones', 'id', 'SET NULL'),
            ('activos', 'activos', 'fk_activos_estado_operativo', 'estado_operativo_id', 'activos.estados_operativos', 'id', 'SET NULL'),

            -- ── Schema: gestion_vehicular ─────────────────────────────────────
            ('gestion_vehicular', 'asignaciones_vehiculares', 'fk_asig_veh_activo', 'activo_id', 'activos.activos', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'asignaciones_vehiculares', 'fk_asig_veh_asignado_por', 'asignado_por_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'bitacoras_vehiculares', 'fk_bitacora_veh_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'cargas_combustible', 'fk_carga_comb_salida_vehicular', 'salida_vehicular_id', 'gestion_vehicular.salidas_vehiculares', 'id', 'SET NULL'),
            ('gestion_vehicular', 'conductores', 'fk_conductores_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'control_activo', 'fk_gv_control_activo_activo', 'activo_id', 'activos.activos', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'control_activo', 'fk_gv_control_activo_recibido_por', 'recibido_por_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('gestion_vehicular', 'control_activo_detalle', 'fk_gv_control_det_accesorio', 'accesorio_id', 'activos.accesorios', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'registros_porteria', 'fk_reg_porteria_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('gestion_vehicular', 'registros_porteria', 'fk_reg_porteria_guardia_salida', 'guardia_salida_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('gestion_vehicular', 'registros_porteria', 'fk_reg_porteria_guardia_llegada', 'guardia_llegada_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('gestion_vehicular', 'salidas_vehiculares', 'fk_salidas_veh_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'salidas_vehiculares_eventos', 'fk_salidas_veh_ev_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'fk_sol_veh_solicitante', 'solicitante_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'fk_sol_veh_resp_asignacion', 'responsable_asignacion_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'fk_sol_veh_conductor_asignado', 'conductor_asignado_id', 'gestion_vehicular.conductores', 'id', 'SET NULL'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'fk_sol_veh_activo', 'activo_id', 'activos.activos', 'id', 'SET NULL'),

            -- ── Schema: incidentes ────────────────────────────────────────────
            ('incidentes', 'incidentes_activos', 'fk_incidentes_activos_empleado_reporta', 'empleado_reporta_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('incidentes', 'incidentes_involucrados', 'fk_incidentes_involucrados_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'SET NULL'),

            -- ── Schema: inventarios ───────────────────────────────────────────
            ('inventarios', 'categorias_insumo', 'fk_categorias_insumo_tipo_insumo', 'tipo_insumo_id', 'inventarios.tipos_insumo', 'id', 'RESTRICT'),

            -- ── Schema: mantenimientos ────────────────────────────────────────
            ('mantenimientos', 'control_activo', 'fk_mant_control_activo_solicitud', 'solicitud_mantenimiento_id', 'mantenimientos.solicitudes_mantenimiento', 'id', 'CASCADE'),
            ('mantenimientos', 'control_activo', 'fk_mant_control_activo_orden_trabajo', 'orden_trabajo_id', 'mantenimientos.orden_trabajo', 'id', 'SET NULL'),
            ('mantenimientos', 'control_activo', 'fk_mant_control_activo_activo', 'activo_id', 'activos.activos', 'id', 'RESTRICT'),
            ('mantenimientos', 'control_activo', 'fk_mant_control_activo_entregado_por', 'entregado_por_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('mantenimientos', 'control_activo', 'fk_mant_control_activo_recibido_por', 'recibido_por_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('mantenimientos', 'control_activo_detalle', 'fk_mant_control_det_control_activo', 'control_activo_id', 'mantenimientos.control_activo', 'id', 'CASCADE'),
            ('mantenimientos', 'control_activo_detalle', 'fk_mant_control_det_accesorio', 'accesorio_id', 'activos.accesorios', 'id', 'RESTRICT'),
            ('mantenimientos', 'orden_trabajo', 'fk_orden_trabajo_solicitud', 'solicitud_mantenimiento_id', 'mantenimientos.solicitudes_mantenimiento', 'id', 'RESTRICT'),
            ('mantenimientos', 'orden_trabajo', 'fk_orden_trabajo_activo', 'activo_id', 'activos.activos', 'id', 'RESTRICT'),
            ('mantenimientos', 'orden_trabajo', 'fk_orden_trabajo_responsable', 'responsable_id', 'organizacion.empleados', 'id', 'RESTRICT'),
            ('mantenimientos', 'orden_trabajo_actividad_evidencias', 'fk_ot_act_evidencias_ot_actividad', 'orden_trabajo_actividad_id', 'mantenimientos.orden_trabajo_actividades', 'id', 'CASCADE'),
            ('mantenimientos', 'orden_trabajo_actividades', 'fk_ot_actividades_orden_trabajo', 'orden_trabajo_id', 'mantenimientos.orden_trabajo', 'id', 'CASCADE'),
            ('mantenimientos', 'orden_trabajo_actividades', 'fk_ot_actividades_actividad_mant', 'actividad_mantenimiento_id', 'mantenimientos.actividades_mantenimiento', 'id', 'SET NULL'),
            ('mantenimientos', 'orden_trabajo_adjuntos', 'fk_ot_adjuntos_orden_trabajo', 'orden_trabajo_id', 'mantenimientos.orden_trabajo', 'id', 'CASCADE'),
            ('mantenimientos', 'solicitudes_mantenimiento', 'fk_sol_mant_recibido_por', 'recibido_por_id', 'organizacion.empleados', 'id', 'SET NULL'),

            -- ── Schema: organizacion ──────────────────────────────────────────
            ('organizacion', 'grupos_aprobadores_dependientes', 'fk_grp_aprob_dep_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'CASCADE'),
            ('organizacion', 'grupos_aprobadores_detalles', 'fk_grp_aprob_det_empleado', 'empleado_id', 'organizacion.empleados', 'id', 'SET NULL'),
            ('organizacion', 'grupos_aprobadores_detalles', 'fk_grp_aprob_det_cargo', 'cargo_id', 'organizacion.cargos', 'id', 'SET NULL'),
            ('organizacion', 'grupos_aprobadores_detalles', 'fk_grp_aprob_det_responsabilidad', 'responsabilidad_id', 'organizacion.responsabilidades', 'id', 'SET NULL'),

            -- ── Schema: seguridad ─────────────────────────────────────────────
            ('seguridad', 'usuarios', 'fk_seguridad_usuarios_persona', 'persona_id', 'organizacion.personas', 'id', 'SET NULL')
        ) AS t(sch, tbl, con_name, col_name, ref_tbl, ref_col, on_delete)
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_class cl ON cl.oid = c.conrelid
            JOIN pg_namespace ns ON ns.oid = cl.relnamespace
            WHERE ns.nspname = fk.sch
              AND cl.relname = fk.tbl
              AND c.conname = fk.con_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s (%I) ON DELETE %s NOT VALID',
                fk.sch, fk.tbl, fk.con_name, fk.col_name, fk.ref_tbl, fk.ref_col, fk.on_delete
            );

            BEGIN
                EXECUTE format(
                    'ALTER TABLE %I.%I VALIDATE CONSTRAINT %I',
                    fk.sch, fk.tbl, fk.con_name
                );
            EXCEPTION
                WHEN foreign_key_violation THEN
                    RAISE NOTICE 'FK % en %.% creada como NOT VALID por registros históricos huérfanos',
                        fk.con_name, fk.sch, fk.tbl;
            END;
        END IF;
    END LOOP;
END $$;

-- ── Índices de soporte para consultas JOIN / DELETE sobre las nuevas FKs ──────
CREATE INDEX IF NOT EXISTS idx_activo_asignaciones_empleado_id ON activos.activo_asignaciones (empleado_id);
CREATE INDEX IF NOT EXISTS idx_activo_asignaciones_area_id ON activos.activo_asignaciones (area_id);
CREATE INDEX IF NOT EXISTS idx_activo_documento_activo_id ON activos.activo_documento (activo_id);
CREATE INDEX IF NOT EXISTS idx_activo_documento_tipo_documento_id ON activos.activo_documento (tipo_documento_id);
CREATE INDEX IF NOT EXISTS idx_activos_ubicacion_id ON activos.activos (ubicacion_id);
CREATE INDEX IF NOT EXISTS idx_activos_estado_operativo_id ON activos.activos (estado_operativo_id);

CREATE INDEX IF NOT EXISTS idx_asig_veh_activo_id ON gestion_vehicular.asignaciones_vehiculares (activo_id);
CREATE INDEX IF NOT EXISTS idx_asig_veh_asignado_por_id ON gestion_vehicular.asignaciones_vehiculares (asignado_por_id);
CREATE INDEX IF NOT EXISTS idx_bitacora_veh_empleado_id ON gestion_vehicular.bitacoras_vehiculares (empleado_id);
CREATE INDEX IF NOT EXISTS idx_carga_comb_salida_vehicular_id ON gestion_vehicular.cargas_combustible (salida_vehicular_id);
CREATE INDEX IF NOT EXISTS idx_conductores_empleado_id ON gestion_vehicular.conductores (empleado_id);
CREATE INDEX IF NOT EXISTS idx_gv_control_activo_activo_id ON gestion_vehicular.control_activo (activo_id);
CREATE INDEX IF NOT EXISTS idx_gv_control_activo_recibido_por_id ON gestion_vehicular.control_activo (recibido_por_id);
CREATE INDEX IF NOT EXISTS idx_gv_control_det_accesorio_id ON gestion_vehicular.control_activo_detalle (accesorio_id);
CREATE INDEX IF NOT EXISTS idx_reg_porteria_empleado_id ON gestion_vehicular.registros_porteria (empleado_id);
CREATE INDEX IF NOT EXISTS idx_reg_porteria_guardia_salida_id ON gestion_vehicular.registros_porteria (guardia_salida_id);
CREATE INDEX IF NOT EXISTS idx_reg_porteria_guardia_llegada_id ON gestion_vehicular.registros_porteria (guardia_llegada_id);
CREATE INDEX IF NOT EXISTS idx_salidas_veh_empleado_id ON gestion_vehicular.salidas_vehiculares (empleado_id);
CREATE INDEX IF NOT EXISTS idx_salidas_veh_ev_empleado_id ON gestion_vehicular.salidas_vehiculares_eventos (empleado_id);
CREATE INDEX IF NOT EXISTS idx_sol_veh_solicitante_id ON gestion_vehicular.solicitudes_vehiculares (solicitante_id);
CREATE INDEX IF NOT EXISTS idx_sol_veh_resp_asignacion_id ON gestion_vehicular.solicitudes_vehiculares (responsable_asignacion_id);
CREATE INDEX IF NOT EXISTS idx_sol_veh_conductor_asignado_id ON gestion_vehicular.solicitudes_vehiculares (conductor_asignado_id);
CREATE INDEX IF NOT EXISTS idx_sol_veh_activo_id ON gestion_vehicular.solicitudes_vehiculares (activo_id);

CREATE INDEX IF NOT EXISTS idx_incidentes_activos_empleado_reporta_id ON incidentes.incidentes_activos (empleado_reporta_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_involucrados_empleado_id ON incidentes.incidentes_involucrados (empleado_id);

CREATE INDEX IF NOT EXISTS idx_categorias_insumo_tipo_insumo_id ON inventarios.categorias_insumo (tipo_insumo_id);

CREATE INDEX IF NOT EXISTS idx_mant_control_activo_solicitud_id ON mantenimientos.control_activo (solicitud_mantenimiento_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_activo_ot_id ON mantenimientos.control_activo (orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_activo_activo_id ON mantenimientos.control_activo (activo_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_activo_entregado_por_id ON mantenimientos.control_activo (entregado_por_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_activo_recibido_por_id ON mantenimientos.control_activo (recibido_por_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_det_control_activo_id ON mantenimientos.control_activo_detalle (control_activo_id);
CREATE INDEX IF NOT EXISTS idx_mant_control_det_accesorio_id ON mantenimientos.control_activo_detalle (accesorio_id);
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_solicitud_id ON mantenimientos.orden_trabajo (solicitud_mantenimiento_id);
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_activo_id ON mantenimientos.orden_trabajo (activo_id);
CREATE INDEX IF NOT EXISTS idx_orden_trabajo_responsable_id ON mantenimientos.orden_trabajo (responsable_id);
CREATE INDEX IF NOT EXISTS idx_ot_act_evidencias_ot_actividad_id ON mantenimientos.orden_trabajo_actividad_evidencias (orden_trabajo_actividad_id);
CREATE INDEX IF NOT EXISTS idx_ot_actividades_orden_trabajo_id ON mantenimientos.orden_trabajo_actividades (orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_ot_actividades_actividad_mant_id ON mantenimientos.orden_trabajo_actividades (actividad_mantenimiento_id);
CREATE INDEX IF NOT EXISTS idx_ot_adjuntos_orden_trabajo_id ON mantenimientos.orden_trabajo_adjuntos (orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_sol_mant_recibido_por_id ON mantenimientos.solicitudes_mantenimiento (recibido_por_id);

CREATE INDEX IF NOT EXISTS idx_grp_aprob_dep_empleado_id ON organizacion.grupos_aprobadores_dependientes (empleado_id);
CREATE INDEX IF NOT EXISTS idx_grp_aprob_det_empleado_id ON organizacion.grupos_aprobadores_detalles (empleado_id);
CREATE INDEX IF NOT EXISTS idx_grp_aprob_det_cargo_id ON organizacion.grupos_aprobadores_detalles (cargo_id);
CREATE INDEX IF NOT EXISTS idx_grp_aprob_det_responsabilidad_id ON organizacion.grupos_aprobadores_detalles (responsabilidad_id);

CREATE INDEX IF NOT EXISTS idx_seguridad_usuarios_persona_id ON seguridad.usuarios (persona_id);
