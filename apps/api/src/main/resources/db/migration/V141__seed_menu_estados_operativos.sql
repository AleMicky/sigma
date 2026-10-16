-- ============================================================================
-- Migración: V141__seed_menu_estados_operativos.sql
-- Descripción: Registro del menú de Estados Operativos en Activos > Configuraciones y asignación al rol ADMIN.
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
    'e0000000-0000-4000-a000-000000000345',
    (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES' LIMIT 1),
    'MENU_ACTIVOS_ESTADOS_OPERATIVOS',
    'Estados operativos',
    'ITEM',
    'Activity',
    '#10B981',
    '/estados-operativos',
    NULL,
    'Catálogo y configuración de estados operativos de activos',
    TRUE,
    5,
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
