-- ============================================================================
-- Migración: V150__seed_menu_historial_viajes.sql
-- Descripción: Registro del menú de Historial de Viajes y asignación a roles.
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
)
VALUES (
    'e0000000-0000-4000-a000-000000000089',
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR') LIMIT 1),
    'MENU_VEH_HISTORIAL_VIAJES',
    'Historial de Viajes',
    'ITEM',
    'History',
    '#10B981',
    '/gestion-vehicular/historial-viajes',
    NULL,
    'Consulta y reporte de historial de viajes vehiculares con exportación a Excel',
    TRUE,
    9,
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
)
ON CONFLICT (codigo) DO UPDATE SET
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

