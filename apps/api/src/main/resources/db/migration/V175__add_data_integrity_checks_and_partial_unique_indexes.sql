-- ============================================================================
-- Migración: V175__add_data_integrity_checks_and_partial_unique_indexes.sql
-- Descripción: Agrega restricciones CHECK de integridad de rangos/cantidades
--              (NOT VALID + validación segura) e índices UNIQUE parciales para
--              evitar duplicidades activas en asignaciones y flotas.
-- ============================================================================

DO $$
DECLARE
    chk RECORD;
BEGIN
    FOR chk IN
        SELECT *
        FROM (VALUES
            -- Activos
            ('activos', 'activo_accesorios', 'chk_activo_accesorios_cantidad_pos', 'cantidad > 0'),
            ('activos', 'activo_asignaciones', 'chk_activo_asignaciones_fechas', 'fecha_devolucion IS NULL OR fecha_devolucion >= fecha_asignacion'),

            -- Gestión Vehicular
            ('gestion_vehicular', 'cargas_combustible', 'chk_cargas_combustible_litros_pos', 'litros > 0'),
            ('gestion_vehicular', 'cargas_combustible', 'chk_cargas_combustible_precio_no_neg', 'precio_total >= 0'),
            ('gestion_vehicular', 'viajes_vehiculares', 'chk_viajes_km_salida_no_neg', 'kilometraje_salida IS NULL OR kilometraje_salida >= 0'),
            ('gestion_vehicular', 'viajes_vehiculares', 'chk_viajes_km_rango', 'kilometraje_salida IS NULL OR kilometraje_retorno IS NULL OR kilometraje_retorno >= kilometraje_salida'),
            ('gestion_vehicular', 'viajes_vehiculares', 'chk_viajes_fechas_reales', 'fecha_salida_real IS NULL OR fecha_retorno_real IS NULL OR fecha_retorno_real >= fecha_salida_real'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'chk_sol_veh_pasajeros_pos', 'cantidad_pasajeros > 0'),
            ('gestion_vehicular', 'solicitudes_vehiculares', 'chk_sol_veh_fechas', 'fecha_retorno_estimada >= fecha_salida'),
            ('gestion_vehicular', 'registros_porteria', 'chk_reg_porteria_fechas', 'fecha_hora_llegada IS NULL OR fecha_hora_llegada >= fecha_hora_salida'),
            ('gestion_vehicular', 'registros_porteria_activos', 'chk_reg_porteria_activos_cantidad_pos', 'cantidad > 0'),
            ('gestion_vehicular', 'tipos_solicitud_vehicular', 'chk_tipos_sol_veh_dias_no_neg', 'dias_anticipacion >= 0'),
            ('gestion_vehicular', 'control_activo_detalle', 'chk_gv_ctrl_det_cantidades_no_neg', 'cantidad_esperada >= 0 AND cantidad_encontrada >= 0'),

            -- Mantenimientos
            ('mantenimientos', 'control_activo_detalle', 'chk_mant_ctrl_det_cantidades_no_neg', 'cantidad_esperada >= 0 AND cantidad_encontrada >= 0'),
            ('mantenimientos', 'orden_trabajo', 'chk_orden_trabajo_fechas', 'fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin >= fecha_inicio'),
            ('mantenimientos', 'plan_mantenimiento_activos', 'chk_plan_mant_activos_fechas', 'fecha_fin IS NULL OR fecha_fin >= fecha_inicio'),

            -- Organización y Parámetros
            ('organizacion', 'empleados', 'chk_empleados_fechas', 'fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin >= fecha_inicio'),
            ('organizacion', 'empleados_responsabilidades', 'chk_emp_resp_fechas', 'fecha_fin IS NULL OR fecha_fin >= fecha_inicio'),
            ('parametros', 'gestiones', 'chk_gestiones_fechas', 'fecha_fin >= fecha_inicio'),
            ('parametros', 'periodos', 'chk_periodos_fechas', 'fecha_fin >= fecha_inicio')
        ) AS t(sch, tbl, con_name, expr)
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_class cl ON cl.oid = c.conrelid
            JOIN pg_namespace ns ON ns.oid = cl.relnamespace
            WHERE ns.nspname = chk.sch
              AND cl.relname = chk.tbl
              AND c.conname = chk.con_name
        ) THEN
            EXECUTE format(
                'ALTER TABLE %I.%I ADD CONSTRAINT %I CHECK (%s) NOT VALID',
                chk.sch, chk.tbl, chk.con_name, chk.expr
            );

            BEGIN
                EXECUTE format(
                    'ALTER TABLE %I.%I VALIDATE CONSTRAINT %I',
                    chk.sch, chk.tbl, chk.con_name
                );
            EXCEPTION
                WHEN check_violation THEN
                    RAISE NOTICE 'CHECK % en %.% creado como NOT VALID por registros históricos fuera de rango',
                        chk.con_name, chk.sch, chk.tbl;
            END;
        END IF;
    END LOOP;
END $$;

-- ── Índices UNIQUE parciales para evitar duplicados activos ───────────────────
DO $$
BEGIN
    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS uq_activo_asignaciones_activa
            ON activos.activo_asignaciones (activo_id)
            WHERE fecha_devolucion IS NULL;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'No se creó uq_activo_asignaciones_activa: existen activos con múltiples asignaciones abiertas';
    END;

    BEGIN
        CREATE UNIQUE INDEX IF NOT EXISTS uq_flota_vehiculos_activo
            ON gestion_vehicular.flota_vehiculos (flota_vehicular_id, activo_id)
            WHERE activo = TRUE;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'No se creó uq_flota_vehiculos_activo: existen vehículos duplicados activos en la misma flota';
    END;
END $$;
