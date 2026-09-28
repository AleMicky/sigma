-- ============================================================================
-- Migración: V133__seed_menu_calendario.sql
-- Descripción: Registro del menú de Calendario.
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
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR') LIMIT 1),
    'MENU_CALENDARIO_RESERVAS',
    'Calendario de reservas',
    'ITEM',
    'Calendar',
    '#3B82F6', -- Color azul
    '/gestion-vehicular/calendario',
    NULL,
    'Vista general del calendario',
    TRUE,
    99, -- Al final por ahora
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre          = EXCLUDED.nombre,
    tipo            = EXCLUDED.tipo,
    icono           = EXCLUDED.icono,
    color           = EXCLUDED.color,
    ruta            = EXCLUDED.ruta,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';

-- Garantizar asignación del menú al rol ADMIN
INSERT INTO seguridad.roles_menus (id, rol_id, menu_id, created_at, updated_at, created_by, updated_by)
SELECT
    gen_random_uuid(),
    r.id,
    m.id,
    NOW(),
    NOW(),
    'seed',
    'seed'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE (r.codigo = 'ADMIN' OR r.codigo = 'ROLE_ADMIN' OR r.nombre ILIKE '%admin%')
  AND m.codigo = 'MENU_CALENDARIO_RESERVAS'
ON CONFLICT (rol_id, menu_id) DO NOTHING;
