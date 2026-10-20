-- ============================================================================
-- Migración: V149__seed_menu_programaciones_mantenimiento.sql
-- Descripción: Registro del menú de Programaciones de Mantenimiento en el módulo
--              de Mantenimientos y asignación al rol ADMIN.
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
    gen_random_uuid(),
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS' LIMIT 1),
    'MENU_MANT_PROGRAMACIONES',
    'Programaciones',
    'ITEM',
    'CalendarClock',
    '#F59E0B',
    '/mantenimientos/programaciones-mantenimiento',
    NULL,
    'Programaciones de mantenimiento preventivo por tiempo, kilometraje y horas de uso',
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

