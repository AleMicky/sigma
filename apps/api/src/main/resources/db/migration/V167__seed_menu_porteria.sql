-- ============================================================================
-- Migración: V167__seed_menu_porteria.sql
-- Descripción: Registrar menú Control de Portería en GESTION_VEHICULAR
--              y asignar permisos a los roles del módulo.
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
    'MENU_VEH_PORTERIA',
    'Control de Portería',
    'ITEM',
    'ShieldCheck',
    '#0EA5E9',
    '/gestion-vehicular/porteria',
    NULL,
    'Registro ágil de salidas y llegadas en portería (empleado, hora y activos)',
    TRUE,
    7,
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


