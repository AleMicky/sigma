-- ============================================================================
-- Migración: V188__menus_cuestionarios.sql
-- Descripción: REQ-BIZ-012. Registra el módulo Cuestionarios y sus vistas en
--              seguridad.menus y asigna permisos por rol.
-- ============================================================================

INSERT INTO seguridad.menus (
    id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge,
    descripcion, visible_en_menu, orden, activo,
    created_at, updated_at, created_by, updated_by
)
VALUES (
    'd0000000-0000-4000-a000-000000000010',
    NULL,
    'MOD_CUESTIONARIOS',
    'Cuestionarios',
    'MODULO',
    'ClipboardList',
    '#2563EB',
    NULL,
    NULL,
    'Evaluaciones parametrizables e integradas con módulos operativos',
    TRUE,
    8,
    TRUE,
    NOW(),
    NOW(),
    'flyway-v188',
    'flyway-v188'
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre          = EXCLUDED.nombre,
    tipo            = EXCLUDED.tipo,
    icono           = EXCLUDED.icono,
    color           = EXCLUDED.color,
    descripcion     = EXCLUDED.descripcion,
    visible_en_menu = EXCLUDED.visible_en_menu,
    orden           = EXCLUDED.orden,
    activo          = EXCLUDED.activo,
    updated_at      = NOW(),
    updated_by      = 'flyway-v188';

INSERT INTO seguridad.menus (
    id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge,
    descripcion, visible_en_menu, orden, activo,
    created_at, updated_at, created_by, updated_by
)
VALUES
    (
        gen_random_uuid(),
        (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_CUESTIONARIOS'),
        'MENU_CUESTIONARIOS_PENDIENTES',
        'Mis Evaluaciones',
        'ITEM',
        'CheckSquare',
        '#10B981',
        '/cuestionarios/mis-pendientes',
        NULL,
        'Evaluaciones pendientes y respondidas del usuario actual',
        TRUE,
        1,
        TRUE,
        NOW(), NOW(), 'flyway-v188', 'flyway-v188'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_CUESTIONARIOS'),
        'MENU_CUESTIONARIOS_GESTION',
        'Parametrización',
        'ITEM',
        'SlidersHorizontal',
        '#2563EB',
        '/cuestionarios',
        NULL,
        'Administración de plantillas y constructor de preguntas',
        TRUE,
        2,
        TRUE,
        NOW(), NOW(), 'flyway-v188', 'flyway-v188'
    ),
    (
        gen_random_uuid(),
        (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_CUESTIONARIOS'),
        'MENU_CUESTIONARIOS_RESULTADOS',
        'Resultados y Reportes',
        'ITEM',
        'BarChart3',
        '#0EA5E9',
        '/cuestionarios/resultados',
        NULL,
        'Indicadores, promedios por pregunta y calificación por evaluado',
        TRUE,
        3,
        TRUE,
        NOW(), NOW(), 'flyway-v188', 'flyway-v188'
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
    updated_by      = 'flyway-v188';

-- Módulo padre y "Mis Evaluaciones" para todos los roles activos
INSERT INTO seguridad.roles_menus (
    id, rol_id, menu_id, created_at, updated_at, created_by, updated_by
)
SELECT
    gen_random_uuid(), r.id, m.id, NOW(), NOW(), 'flyway-v188', 'flyway-v188'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE r.activo = TRUE
  AND m.codigo IN ('MOD_CUESTIONARIOS', 'MENU_CUESTIONARIOS_PENDIENTES')
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.roles_menus rm
      WHERE rm.rol_id = r.id AND rm.menu_id = m.id
  );

-- Parametrización solo para ADMIN
INSERT INTO seguridad.roles_menus (
    id, rol_id, menu_id, created_at, updated_at, created_by, updated_by
)
SELECT
    gen_random_uuid(), r.id, m.id, NOW(), NOW(), 'flyway-v188', 'flyway-v188'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE r.codigo = 'ADMIN'
  AND m.codigo = 'MENU_CUESTIONARIOS_GESTION'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.roles_menus rm
      WHERE rm.rol_id = r.id AND rm.menu_id = m.id
  );

-- Resultados y Reportes para ADMIN y SUPERVISOR
INSERT INTO seguridad.roles_menus (
    id, rol_id, menu_id, created_at, updated_at, created_by, updated_by
)
SELECT
    gen_random_uuid(), r.id, m.id, NOW(), NOW(), 'flyway-v188', 'flyway-v188'
FROM seguridad.roles r
CROSS JOIN seguridad.menus m
WHERE r.codigo IN ('ADMIN', 'SUPERVISOR')
  AND m.codigo = 'MENU_CUESTIONARIOS_RESULTADOS'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.roles_menus rm
      WHERE rm.rol_id = r.id AND rm.menu_id = m.id
  );
