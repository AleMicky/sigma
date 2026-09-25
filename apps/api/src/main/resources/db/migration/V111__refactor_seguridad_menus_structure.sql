-- ============================================================================
-- Migration V111: Reestructuración limpia y enriquecimiento de Menús del Sistema
-- - Agrega columnas tipo, badge, descripcion, visible_en_menu
-- - Aplana la jerarquía eliminando niveles duplicados/redundantes
-- - Establece estructura de 2 niveles máximos (Módulo -> Enlace / Agrupador -> Sub-enlace)
-- ============================================================================

-- 1. Agregar nuevas columnas a seguridad.menus si no existen
ALTER TABLE seguridad.menus
    ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'ITEM',
    ADD COLUMN IF NOT EXISTS badge VARCHAR(50),
    ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255),
    ADD COLUMN IF NOT EXISTS visible_en_menu BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_menus_tipo
    ON seguridad.menus (tipo);

-- 2. Limpieza de relaciones de roles con menús antes de reestructurar
-- (Evita inconsistencias en llaves foráneas)
DELETE FROM seguridad.roles_menus
WHERE menu_id IN (
    'e0000000-0000-4000-a000-000000000001', -- MENU_INICIO (redundante con MOD_INICIO)
    'e0000000-0000-4000-a000-000000000002', -- MENU_ORGANIZACION (redundante con MOD_ORGANIZACION)
    'e0000000-0000-4000-a000-000000000003', -- MENU_ACTIVOS (redundante con MOD_ACTIVOS)
    'e0000000-0000-4000-a000-000000000004', -- MENU_INVENTARIOS (redundante con MOD_INVENTARIOS)
    'e0000000-0000-4000-a000-000000000005', -- MENU_PARAMETROS (redundante con MOD_PARAMETROS)
    'e0000000-0000-4000-a000-000000000006', -- MENU_MANTENIMIENTOS (redundante con MOD_MANTENIMIENTOS)
    'e0000000-0000-4000-a000-000000000007'  -- MENU_SEGURIDAD (redundante con MOD_SEGURIDAD)
);

-- Reasignar temporalmente hijos antes de borrar nodos intermedios
UPDATE seguridad.menus SET menu_padre_id = NULL WHERE menu_padre_id IN (
    'e0000000-0000-4000-a000-000000000001',
    'e0000000-0000-4000-a000-000000000002',
    'e0000000-0000-4000-a000-000000000003',
    'e0000000-0000-4000-a000-000000000004',
    'e0000000-0000-4000-a000-000000000005',
    'e0000000-0000-4000-a000-000000000006',
    'e0000000-0000-4000-a000-000000000007'
);

-- Eliminar los menús intermedios redundantes
DELETE FROM seguridad.menus
WHERE id IN (
    'e0000000-0000-4000-a000-000000000001',
    'e0000000-0000-4000-a000-000000000002',
    'e0000000-0000-4000-a000-000000000003',
    'e0000000-0000-4000-a000-000000000004',
    'e0000000-0000-4000-a000-000000000005',
    'e0000000-0000-4000-a000-000000000006',
    'e0000000-0000-4000-a000-000000000007'
);

-- ============================================================================
-- 3. Inserción / Actualización de Módulos Raíz (Nivel 1 - tipo MODULO)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('d0000000-0000-4000-a000-000000000001', NULL, 'MOD_INICIO',         'Inicio',         'MODULO', 'LayoutDashboard', '/',     NULL, 'Página de inicio y resumen general', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000002', NULL, 'MOD_MANTENIMIENTOS', 'Mantenimiento', 'MODULO', 'Wrench',          NULL,    NULL, 'Gestión operativa de mantenimiento',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000003', NULL, 'MOD_ACTIVOS',        'Activos',        'MODULO', 'Boxes',           NULL,    NULL, 'Catálogo y control de activos',      TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000004', NULL, 'MOD_INVENTARIOS',    'Inventarios',    'MODULO', 'Package',         NULL,    NULL, 'Insumos y repuestos',                TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000005', NULL, 'MOD_ORGANIZACION',   'Organización',   'MODULO', 'Building2',       NULL,    NULL, 'Estructura empresarial y personal',  TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000006', NULL, 'MOD_PARAMETROS',     'Parámetros',     'MODULO', 'Settings2',       NULL,    NULL, 'Parámetros y configuraciones base',  TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000007', NULL, 'MOD_SEGURIDAD',      'Seguridad',      'MODULO', 'Shield',          NULL,    NULL, 'Control de accesos, roles y menús',  TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 4. Menús de MANTENIMIENTO (Nivel 2 y 3)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000061', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_SOLICITUDES',     'Solicitudes',             'ITEM',      'FileText',    '/mantenimientos/solicitudes', NULL, 'Registro y seguimiento de solicitudes', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000062', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_APROBACIONES',    'Aprobar Solicitudes',     'ITEM',      'ShieldCheck', '/mantenimientos/aprobaciones', NULL, 'Bandeja de aprobación de solicitudes',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000063', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_ENCARGADO',       'Encargado Mantenimiento', 'ITEM',      'UserCheck',   '/mantenimientos/encargado',    NULL, 'Gestión de órdenes para encargados',    TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000064', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_SUPERVISOR',      'Supervisor Mantenimiento','ITEM',      'ShieldAlert', '/mantenimientos/supervisor',   NULL, 'Control y supervisión de trabajos',     TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000065', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_ACTIVIDADES',     'Actividades',             'ITEM',      'ListTodo',    '/mantenimientos/actividades',  NULL, 'Catálogo de actividades y tareas',      TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000067', 'd0000000-0000-4000-a000-000000000002', 'MENU_MANT_CONFIGURACIONES', 'Configuraciones',         'AGRUPADOR', 'Settings2',   NULL,                          NULL, 'Ajustes del módulo de mantenimiento',    TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000671', 'e0000000-0000-4000-a000-000000000067', 'MENU_MANT_TIPOS',            'Tipos de Mantenimiento',  'ITEM',      'Tags',        '/mantenimientos/tipos-mantenimiento', NULL, 'Definición de tipos de mantenimiento', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000672', 'e0000000-0000-4000-a000-000000000067', 'MENU_MANT_PRIORIDADES',      'Prioridades',             'ITEM',      'AlertCircle', '/mantenimientos/prioridades',        NULL, 'Prioridades de atención',             TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 5. Menús de ACTIVOS (Nivel 2 y 3)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000031', 'd0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_REGISTRO',       'Registro de Activos',      'ITEM',      'Boxes',       '/activos',                    NULL, 'Gestión y ficha de activos fijos',     TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000032', 'd0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CATALOGO',       'Catálogo de Activos',      'ITEM',      'LayoutGrid',  '/activos/catalogo',           NULL, 'Vista de catálogo fotográfico',        TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000033', 'd0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CONSULTA_DOCS',  'Reporte GRS (Documentos)', 'ITEM',      'FileSearch',  '/activos/consulta-documentos',NULL, 'Consulta de expedientes y documentos', TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000034', 'd0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CONFIGURACIONES', 'Configuraciones',          'AGRUPADOR', 'FolderTree',  NULL,                          NULL, 'Tipologías y atributos de activos',    TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000341', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_CATEGORIAS',      'Categorías de activo',     'ITEM',      'FolderTree',  '/categorias',                 NULL, 'Categorías principales',               TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000342', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_TIPOS',           'Tipos de activo',          'ITEM',      'Tags',        '/tipos-activo',               NULL, 'Tipos específicos y plantillas',       TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000343', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_ACCESORIOS',      'Accesorios',               'ITEM',      'Paperclip',   '/accesorios',                 NULL, 'Accesorios y complementos',            TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000344', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_TIPOS_DOCUMENTO', 'Tipos de documento',       'ITEM',      'FileText',    '/tipos-documento',            NULL, 'Clasificación documental',             TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 6. Menús de INVENTARIOS (Nivel 2 y 3)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000041', 'd0000000-0000-4000-a000-000000000004', 'MENU_INVENTARIOS_INSUMOS',         'Insumos',             'ITEM',      'List',       '/inventarios',              NULL, 'Registro y stock de insumos',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000042', 'd0000000-0000-4000-a000-000000000004', 'MENU_INVENTARIOS_CONFIGURACIONES', 'Configuraciones',     'AGRUPADOR', 'FolderTree', NULL,                        NULL, 'Clasificación de insumos',           TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000421', 'e0000000-0000-4000-a000-000000000042', 'MENU_INVENTARIOS_TIPOS_INSUMO',     'Tipos de insumo',     'ITEM',      'Tags',       '/inventarios/tipos-insumo', NULL, 'Tipologías de insumo',               TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000422', 'e0000000-0000-4000-a000-000000000042', 'MENU_INVENTARIOS_CATEGORIAS',       'Categorías Insumo',   'ITEM',      'FolderTree', '/inventarios/categorias',   NULL, 'Categorías de insumo',             TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 7. Menús de ORGANIZACIÓN (Nivel 2)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000021', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_EMPLEADOS',          'Empleados',          'ITEM', 'UserCheck',   '/organizacion/empleados',          NULL, 'Nómina y ficha de empleados',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000022', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_AREAS',              'Áreas',              'ITEM', 'Building',    '/organizacion/areas',              NULL, 'Estructura organizacional y áreas',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000023', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_CARGOS',             'Cargos',             'ITEM', 'Briefcase',   '/organizacion/cargos',             NULL, 'Puestos y cargos laborales',         TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000024', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_PERSONAS',           'Personas',           'ITEM', 'Users',       '/organizacion/personas',           NULL, 'Registro general de personas',       TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000025', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_RESPONSABILIDADES',  'Responsabilidades',  'ITEM', 'Award',       '/organizacion/responsabilidades',  NULL, 'Roles y responsabilidades internas', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000026', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_GRUPOS_APROBADORES', 'Grupos Aprobadores', 'ITEM', 'ShieldCheck', '/organizacion/grupos-aprobadores', NULL, 'Flujos y niveles de aprobación',     TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000271', 'd0000000-0000-4000-a000-000000000005', 'MENU_ORG_MIGRACIONES',        'Logs de Migración',  'ITEM', 'ScrollText',  '/organizacion/migraciones',        NULL, 'Historial y registros de migración', TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 8. Menús de PARÁMETROS (Nivel 2 y 3)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000051', 'd0000000-0000-4000-a000-000000000006', 'MENU_PARAMETROS_GESTION',         'Gestión',             'ITEM',      'SlidersHorizontal', '/parametros/gestion',        NULL, 'Gestión de períodos y ejercicios',    TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000052', 'd0000000-0000-4000-a000-000000000006', 'MENU_PARAMETROS_CATALOGOS',        'Catálogos',           'ITEM',      'BookOpen',          '/parametros/catalogos',      NULL, 'Tablas maestras del sistema',         TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000053', 'd0000000-0000-4000-a000-000000000006', 'MENU_PARAMETROS_CONFIGURACIONES', 'Configuraciones',     'AGRUPADOR', 'Settings2',         NULL,                         NULL, 'Ajustes de datos y mediciones',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000531', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_TIPOS_DATO',      'Tipos de datos',      'ITEM',      'Type',              '/parametros/tipos-dato',     NULL, 'Definición de tipos de dato dinámico',TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000532', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_UBICACIONES',     'Ubicaciones',         'ITEM',      'MapPin',            '/parametros/ubicaciones',    NULL, 'Plantas, centrales y ubicaciones',    TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000533', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_UNIDADES_MEDIDA', 'Unidades de medida',  'ITEM',      'Ruler',             '/parametros/unidades-medida',NULL, 'Unidades de medida estandarizadas',   TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 9. Menús de SEGURIDAD (Nivel 2)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000071', 'd0000000-0000-4000-a000-000000000007', 'MENU_SEG_USUARIOS', 'Usuarios', 'ITEM', 'Users',       '/seguridad/usuarios', NULL, 'Cuentas de usuario y accesos',      TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000072', 'd0000000-0000-4000-a000-000000000007', 'MENU_SEG_ROLES',    'Roles',    'ITEM', 'ShieldCheck', '/seguridad/roles',    NULL, 'Perfiles y asignación de permisos', TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000073', 'd0000000-0000-4000-a000-000000000007', 'MENU_SEG_MENUS',    'Menús',    'ITEM', 'FolderTree',  '/seguridad/menus',    NULL, 'Árbol de navegación y rutas',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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
