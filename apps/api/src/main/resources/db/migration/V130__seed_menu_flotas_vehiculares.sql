-- ============================================================================
-- Migración: V130__seed_menu_flotas_vehiculares.sql
-- Descripción: Registro del menú de Flotas Vehiculares y asignación al rol ADMIN.
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
    'e0000000-0000-4000-a000-000000000086',
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR') LIMIT 1),
    'MENU_VEH_FLOTAS',
    'Flotas Vehiculares',
    'ITEM',
    'Layers',
    '#06B6D4',
    '/gestion-vehicular/flotas',
    NULL,
    'Administración de flotas vehiculares, vehículos asignados y responsables',
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

-- Reorganizar orden de los menús dentro de Gestión Vehicular
UPDATE seguridad.menus
SET orden = 1, updated_at = NOW()
WHERE codigo = 'MENU_VEH_SOLICITUDES';

UPDATE seguridad.menus
SET orden = 2, updated_at = NOW()
WHERE codigo = 'MENU_VEH_ASIGNACIONES';

UPDATE seguridad.menus
SET orden = 3, updated_at = NOW()
WHERE codigo = 'MENU_VEH_VIAJES';

UPDATE seguridad.menus
SET orden = 4, updated_at = NOW()
WHERE codigo = 'MENU_VEH_FLOTAS';

UPDATE seguridad.menus
SET orden = 5, updated_at = NOW()
WHERE codigo = 'MENU_VEH_CONDUCTORES';

UPDATE seguridad.menus
SET orden = 6, updated_at = NOW()
WHERE codigo = 'MENU_VEH_TIPOS_SOLICITUD';

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
  AND m.codigo = 'MENU_VEH_FLOTAS'
ON CONFLICT (rol_id, menu_id) DO NOTHING;
