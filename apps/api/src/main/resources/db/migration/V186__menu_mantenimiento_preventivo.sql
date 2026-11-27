-- ============================================================================
-- Migración: V186__menu_mantenimiento_preventivo.sql
-- Descripción: REQ-MANT-036. Registra la nueva interfaz centralizada de
--              Mantenimiento Preventivo (/mantenimientos/preventivo) en
--              seguridad.menus y la asigna a ADMIN, ENCARGADO y SUPERVISOR.
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
    (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'),
    'MENU_MANT_PREVENTIVO',
    'Mantenimiento Preventivo',
    'ITEM',
    'CalendarCheck',
    '#3B82F6',
    '/mantenimientos/preventivo',
    NULL,
    'Centro unificado de planes preventivos, seguimiento, histórico y configuración',
    TRUE,
    7,
    TRUE,
    NOW(),
    NOW(),
    'flyway-v186',
    'flyway-v186'
)
ON CONFLICT (codigo) DO UPDATE SET
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
    updated_by      = 'flyway-v186';

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
    r.id,
    m.id,
    NOW(),
    NOW(),
    'flyway-v186',
    'flyway-v186'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE r.codigo IN ('ADMIN', 'ENCARGADO', 'SUPERVISOR')
  AND m.codigo = 'MENU_MANT_PREVENTIVO'
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;
