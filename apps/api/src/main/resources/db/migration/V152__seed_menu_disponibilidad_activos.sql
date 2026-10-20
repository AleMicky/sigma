-- ============================================================================
-- Migración: V152__seed_menu_disponibilidad_activos.sql
-- Descripción: Registro del menú de Reporte de Disponibilidad y Estado Operativo de Activos.
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
    'e0000000-0000-4000-a000-000000000035',
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_ACTIVOS', 'MENU_ACTIVOS') LIMIT 1),
    'MENU_ACTIVOS_DISPONIBILIDAD',
    'Disponibilidad y Estados',
    'ITEM',
    'Activity',
    '#10B981',
    '/activos/disponibilidad',
    NULL,
    'Reporte de disponibilidad técnica y estados operativos de activos con exportación a Excel',
    TRUE,
    5,
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
