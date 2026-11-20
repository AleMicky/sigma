-- ============================================================================
-- Migración: V177__seed_menu_vehiculos.sql
-- Descripción: Registrar menú Vehículos en GESTION_VEHICULAR.
--              Solo se registra el menú (sin asignación de roles a ADMIN).
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
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR' LIMIT 1),
    'MENU_VEH_VEHICULOS',
    'Vehículos',
    'ITEM',
    'CarFront',
    '#06B6D4',
    '/gestion-vehicular/vehiculos',
    NULL,
    'Listado y consulta de activos de tipo Vehículo con todos sus atributos e imágenes',
    TRUE,
    9,
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
    badge           = EXCLUDED.badge,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';
