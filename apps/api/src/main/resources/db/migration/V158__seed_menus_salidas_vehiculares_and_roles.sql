-- ============================================================================
-- Migración: V158__seed_menus_salidas_vehiculares_and_roles.sql
-- Descripción: Registrar menús de Salidas Vehiculares y Reporte de Salidas
--              y asignar permisos a los roles correspondientes.
-- ============================================================================

-- 1. Menú Salidas Vehiculares en GESTION_VEHICULAR
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
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR' LIMIT 1),
    'MENU_VEH_SALIDAS',
    'Salidas Vehiculares',
    'ITEM',
    'Car',
    '#06B6D4',
    '/gestion-vehicular/salidas',
    NULL,
    'Control y ciclo de vida de salidas vehiculares BPMN',
    TRUE,
    6,
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
) ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id   = EXCLUDED.menu_padre_id,
    nombre          = EXCLUDED.nombre,
    tipo            = EXCLUDED.tipo,
    icono           = EXCLUDED.icono,
    color           = EXCLUDED.color,
    ruta            = EXCLUDED.ruta,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';

-- 2. Menú Reporte Salidas Vehiculares en REPORTES_GESTION_VEHICULAR
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
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR' LIMIT 1),
    'MENU_VEH_REP_SALIDAS',
    'Salidas Vehiculares',
    'ITEM',
    'BarChart3',
    '#06B6D4',
    '/gestion-vehicular/reportes/salidas-vehiculares',
    NULL,
    'Reporte consolidado de salidas, kilometrajes y bitácoras',
    TRUE,
    4,
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
) ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id   = EXCLUDED.menu_padre_id,
    nombre          = EXCLUDED.nombre,
    tipo            = EXCLUDED.tipo,
    icono           = EXCLUDED.icono,
    color           = EXCLUDED.color,
    ruta            = EXCLUDED.ruta,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';

-- 3. Asignar los nuevos menús a todos los roles que ya tienen acceso al módulo MOD_GESTION_VEHICULAR
INSERT INTO seguridad.roles_menus (
    id,
    rol_id,
    menu_id,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT
    gen_random_uuid(),
    rm.rol_id,
    m.id,
    NOW(),
    NOW(),
    'seed',
    'seed'
FROM seguridad.menus m
JOIN seguridad.roles_menus rm ON rm.menu_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR' LIMIT 1)
WHERE m.codigo IN ('MENU_VEH_SALIDAS', 'MENU_VEH_REP_SALIDAS')
ON CONFLICT (rol_id, menu_id) DO NOTHING;

