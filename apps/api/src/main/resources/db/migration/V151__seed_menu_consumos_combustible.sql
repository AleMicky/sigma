-- ============================================================================
-- Migración: V151__seed_menu_consumos_combustible.sql
-- Descripción: Registro del menú de Reporte de Consumo de Combustible.
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
    'e0000000-0000-4000-a000-000000000090',
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR') LIMIT 1),
    'MENU_VEH_CONSUMO_COMBUSTIBLE',
    'Consumo de Combustible',
    'ITEM',
    'Fuel',
    '#D97706',
    '/gestion-vehicular/consumo-combustible',
    NULL,
    'Reporte y seguimiento de consumos y cargas de combustible con exportación a Excel',
    TRUE,
    10,
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
