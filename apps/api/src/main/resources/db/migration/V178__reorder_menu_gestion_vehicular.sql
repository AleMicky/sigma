-- ============================================================================
-- Migración: V178__reorder_menu_gestion_vehicular.sql
-- Descripción: Reordena los ítems del menú del módulo Gestión Vehicular
--              (MOD_GESTION_VEHICULAR) siguiendo el flujo operativo y dejando
--              los agrupadores Reportes y Configuraciones al final.
--              Resuelve la colisión en orden = 7 (Configuraciones vs Portería)
--              y ubica Vehículos junto al Dashboard.
-- ============================================================================

UPDATE seguridad.menus AS m
SET orden      = v.orden,
    updated_at = NOW(),
    updated_by = 'seed'
FROM (
    VALUES
        ('MENU_VEH_DASHBOARD',                     1),
        ('MENU_VEH_VEHICULOS',                     2),
        ('MENU_VEH_SOLICITUDES',                   3),
        ('MENU_VEH_ASIGNACIONES',                  4),
        ('MENU_VEH_SALIDAS',                       5),
        ('MENU_VEH_MIS_VIAJES',                    6),
        ('MENU_VEH_PORTERIA',                      7),
        ('MENU_VEH_CALENDARIO_RESERVAS',           8),
        ('REPORTES_GESTION_VEHICULAR',             9),
        ('MENU_CONFIGURACIONES_GESTION_VEHICULAR', 10)
) AS v(codigo, orden)
WHERE m.codigo = v.codigo;
