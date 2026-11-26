-- ============================================================================
-- Migración: V183__menus_reporte_gestion_vehicular.sql
-- Descripción: alinea los menús de SOLICITANTE_MOVILIDAD y SUPERVISOR con la
--              matriz REPORTE aprobada (REQ-VEH-002 / QA 2026-11-26). V159
--              dejó a SOLICITANTE_MOVILIDAD sin los menús de solo lectura de
--              reportes y a SUPERVISOR sin menús vehiculares. No modifica V159
--              ni V182 y no concede menús de escritura (asignaciones, salidas,
--              portería, solicitudes ni configuraciones).
-- ============================================================================

INSERT INTO seguridad.roles_menus (id, rol_id, menu_id, created_at, updated_at, created_by, updated_by)
SELECT
    gen_random_uuid(),
    r.id,
    m.id,
    NOW(),
    NOW(),
    'flyway-v183',
    'flyway-v183'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE (r.codigo = 'SOLICITANTE_MOVILIDAD' OR r.codigo = 'SUPERVISOR')
  AND m.codigo IN (
      'MOD_GESTION_VEHICULAR',                  -- módulo (contenedor de navegación)
      'MENU_VEH_DASHBOARD',                     -- solo lectura
      'REPORTES_GESTION_VEHICULAR',             -- agrupador de reportes
      'MENU_VEH_HISTORIAL_VIAJES',              -- solo lectura
      'MENU_VEH_CONSUMO_COMBUSTIBLE',           -- solo lectura
      'MENU_VEH_BITACORA',                      -- solo lectura
      'MENU_VEH_REP_SALIDAS',                   -- solo lectura
      'MENU_VEH_CALENDARIO_RESERVAS'            -- visualización de disponibilidad
  )
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;
