-- ============================================================================
-- Migración: V145__seed_menu_planes_mantenimiento.sql
-- Descripción: Registro del menú de Planes de Mantenimiento en Mantenimientos y asignación al rol ADMIN.
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
    'e0000000-0000-4000-a000-000000000066',
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS' LIMIT 1),
    'MENU_MANT_PLANES',
    'Planes de Mantenimiento',
    'ITEM',
    'ClipboardList',
    '#3B82F6',
    '/mantenimientos/planes-mantenimiento',
    NULL,
    'Catálogo y gestión de planes de mantenimiento preventivo',
    TRUE,
    8,
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


