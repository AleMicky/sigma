-- ============================================================================
-- Migración: V165__seed_menu_reporte_solicitudes_vehiculares.sql
-- Descripción: Registrar menú Reporte de Solicitudes Vehiculares y roles
-- ============================================================================

INSERT INTO seguridad.menus (
    id,
    menu_padre_id,
    codigo,
    nombre,
    tipo,
    icono,
    color,
    ruta,
    badge,
    descripcion,
    visible_en_menu,
    orden,
    activo,
    created_at,
    updated_at,
    created_by,
    updated_by
) VALUES (
    '22fc07b6-8150-4869-919c-a9b722373516',
    (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR' LIMIT 1),
    'MENU_VEH_REP_SOLICITUDES',
    'Solicitudes Vehiculares',
    'ITEM',
    'FileText',
    '#06B6D4',
    '/gestion-vehicular/reportes/solicitudes-vehiculares',
    NULL,
    'Reporte consolidado de solicitudes de vehículos, asignaciones y pasajeros',
    TRUE,
    5,
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
) ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id   = EXCLUDED.menu_padre_id,
    nombre          = EXCLUDED.nombre,
    tipo            = EXCLUDED.tipo,
    icono           = EXCLUDED.icono,
    color           = EXCLUDED.color,
    ruta            = EXCLUDED.ruta,
    badge           = EXCLUDED.badge,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';


