-- ============================================================================
-- Migración: V164__seed_menu_incidentes.sql
-- Descripción: Registro del menú de Gestión de Incidentes de Activos y asignación de roles.
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
    'MENU_ACTIVOS_INCIDENTES',
    'Gestión de Incidentes',
    'ITEM',
    'AlertTriangle',
    '#EF4444',
    '/activos/incidentes',
    NULL,
    'Registro y seguimiento de incidentes, siniestros y flujo de atención de activos',
    TRUE,
    4,
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

-- Garantizar asignación del menú a los roles principales
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
WHERE (r.codigo IN ('ADMIN', 'ROLE_ADMIN', 'RESPONSABLE_ACTIVOS') OR r.nombre ILIKE '%admin%')
  AND m.codigo = 'MENU_ACTIVOS_INCIDENTES'
ON CONFLICT (rol_id, menu_id) DO NOTHING;

