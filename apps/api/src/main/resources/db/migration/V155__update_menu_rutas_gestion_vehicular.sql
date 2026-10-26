-- ============================================================================
-- Migración: V155__update_menu_rutas_gestion_vehicular.sql
-- Descripción: Actualiza las rutas de menú de Gestión Vehicular para reflejar
--              la estructura modular en 'configuraciones' y 'reportes'.
-- ============================================================================

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/configuraciones/conductores',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_CONDUCTORES';

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/configuraciones/flotas',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_FLOTAS';

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/configuraciones/tipos-solicitud',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_TIPOS_SOLICITUD';

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/reportes/bitacora',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_BITACORA';

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/reportes/consumo-combustible',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_CONSUMO_COMBUSTIBLE';

UPDATE seguridad.menus
SET ruta = '/gestion-vehicular/reportes/historial-viajes',
    updated_at = NOW(),
    updated_by = 'seed'
WHERE codigo = 'MENU_VEH_HISTORIAL_VIAJES';
