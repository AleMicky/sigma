-- ============================================================================
-- Migración: V115__seed_menu_tipos_solicitud_vehicular.sql
-- Descripción: Registro del menú de Tipos de Solicitud Vehicular y asignación al rol ADMIN.
-- ============================================================================

INSERT INTO seguridad.menus (
    id,
    menu_padre_id,
    codigo,
    nombre,
    tipo,
    icono,
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
    'e0000000-0000-4000-a000-000000000082',
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'),
    'MENU_VEH_TIPOS_SOLICITUD',
    'Tipos de Solicitud',
    'ITEM',
    'FileText',
    '/gestion-vehicular/tipos-solicitud',
    NULL,
    'Catálogo de tipos de solicitud vehicular',
    TRUE,
    2,
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
    ruta            = EXCLUDED.ruta,
    badge           = EXCLUDED.badge,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
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
  AND m.codigo = 'MENU_VEH_TIPOS_SOLICITUD'
ON CONFLICT (rol_id, menu_id) DO NOTHING;
