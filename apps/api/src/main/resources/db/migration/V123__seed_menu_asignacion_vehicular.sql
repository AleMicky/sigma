-- ============================================================================
-- Migración: V123__seed_menu_asignacion_vehicular.sql
-- Descripción: Registro del menú de Asignación Vehicular y asignación al rol ADMIN.
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
    'e0000000-0000-4000-a000-000000000084',
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'),
    'MENU_VEH_ASIGNACIONES',
    'Asignación Vehicular',
    'ITEM',
    'KeyRound',
    '/gestion-vehicular/asignaciones',
    NULL,
    'Bandeja de revisión, aprobación y asignación vehicular',
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

-- Reorganizar orden de los menús dentro de MOD_GESTION_VEHICULAR:
-- 1. Solicitudes de Vehículos
-- 2. Asignación Vehicular
-- 3. Conductores
-- 4. Tipos de Solicitud
UPDATE seguridad.menus
SET orden = 1, updated_at = NOW()
WHERE codigo = 'MENU_VEH_SOLICITUDES';

UPDATE seguridad.menus
SET orden = 2, updated_at = NOW()
WHERE codigo = 'MENU_VEH_ASIGNACIONES';

UPDATE seguridad.menus
SET orden = 3, updated_at = NOW()
WHERE codigo = 'MENU_VEH_CONDUCTORES';

UPDATE seguridad.menus
SET orden = 4, updated_at = NOW()
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
  AND m.codigo = 'MENU_VEH_ASIGNACIONES'
ON CONFLICT (rol_id, menu_id) DO NOTHING;
