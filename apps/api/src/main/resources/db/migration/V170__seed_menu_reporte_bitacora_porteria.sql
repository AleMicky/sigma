-- ============================================================================
-- Migración: V170__seed_menu_reporte_bitacora_porteria.sql
-- Descripción: Registrar menú Bitácora de Portería en REPORTES_GESTION_VEHICULAR
--              (solo registro del menú, sin asignación a rol ADMIN).
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
    '94b3e5a2-7c41-4a89-9b12-f38c72d40190',
    (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR' LIMIT 1),
    'MENU_VEH_REP_PORTERIA',
    'Bitácora de Portería',
    'ITEM',
    'ShieldCheck',
    '#0EA5E9',
    '/gestion-vehicular/reportes/porteria',
    NULL,
    'Reporte oficial tipo bitácora de control de portería, salidas, llegadas y activos',
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
    badge           = EXCLUDED.badge,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'seed';
