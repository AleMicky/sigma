-- ============================================================================
-- Migration V112: Reorganización limpia y modular de Menús por Módulo Web
-- - Orden estricto según arquitectura modular web:
--   1. Inicio
--   2. Organización
--   3. Activos
--   4. Inventarios
--   5. Gestión Vehicular
--   6. Mantenimientos
--   7. Parámetros
--   8. Seguridad
-- - Respeta claves foráneas y resuelve menu_padre_id dinámicamente
-- - Vincula todos los menús y módulos activos al rol ADMIN / ROLE_ADMIN
-- ============================================================================

-- 1. Módulos Raíz (Nivel 1 - tipo MODULO)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('d0000000-0000-4000-a000-000000000001', NULL, 'MOD_INICIO',            'Inicio',            'MODULO', 'LayoutDashboard', '/',     NULL, 'Página de inicio y resumen general',    TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000002', NULL, 'MOD_ORGANIZACION',      'Organización',      'MODULO', 'Building2',       NULL,    NULL, 'Estructura empresarial y personal',     TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000003', NULL, 'MOD_ACTIVOS',           'Activos',           'MODULO', 'Boxes',           NULL,    NULL, 'Catálogo y control de activos',         TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000004', NULL, 'MOD_INVENTARIOS',       'Inventarios',       'MODULO', 'Package',         NULL,    NULL, 'Insumos y repuestos',                   TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000008', NULL, 'MOD_GESTION_VEHICULAR', 'Gestión Vehicular','MODULO', 'CarFront',        NULL,    NULL, 'Control de flota, conductores y viajes', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000006', NULL, 'MOD_MANTENIMIENTOS',    'Mantenimiento',    'MODULO', 'Wrench',          NULL,    NULL, 'Gestión operativa de mantenimiento',     TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000005', NULL, 'MOD_PARAMETROS',        'Parámetros',        'MODULO', 'Settings2',       NULL,    NULL, 'Parámetros y configuraciones base',     TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000007', NULL, 'MOD_SEGURIDAD',         'Seguridad',         'MODULO', 'Shield',          NULL,    NULL, 'Control de accesos, roles y menús',     TRUE, 8, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
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

-- 2. Menús de ORGANIZACIÓN (Hijos de MOD_ORGANIZACION)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000021', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_EMPLEADOS',          'Empleados',          'ITEM', 'UserCheck',   '/organizacion/empleados',          NULL, 'Nómina y ficha de empleados',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000022', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_AREAS',              'Áreas',              'ITEM', 'Building',    '/organizacion/areas',              NULL, 'Estructura organizacional y áreas',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000023', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_CARGOS',             'Cargos',             'ITEM', 'Briefcase',   '/organizacion/cargos',             NULL, 'Puestos y cargos laborales',         TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000024', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_PERSONAS',           'Personas',           'ITEM', 'Users',       '/organizacion/personas',           NULL, 'Registro general de personas',       TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000025', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_RESPONSABILIDADES',  'Responsabilidades',  'ITEM', 'Award',       '/organizacion/responsabilidades',  NULL, 'Roles y responsabilidades internas', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000026', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_GRUPOS_APROBADORES', 'Grupos Aprobadores', 'ITEM', 'ShieldCheck', '/organizacion/grupos-aprobadores', NULL, 'Flujos y niveles de aprobación',     TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000271', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_MIGRACIONES',        'Logs de Migración',  'ITEM', 'ScrollText',  '/organizacion/migraciones',        NULL, 'Historial y registros de migración', TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 3. Menús de ACTIVOS (Hijos de MOD_ACTIVOS)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000031', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_REGISTRO',       'Registro de Activos',      'ITEM',      'Boxes',       '/activos',                    NULL, 'Gestión y ficha de activos fijos',     TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000032', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CATALOGO',       'Catálogo de Activos',      'ITEM',      'LayoutGrid',  '/activos/catalogo',           NULL, 'Vista de catálogo fotográfico',        TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000033', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CONSULTA_DOCS',  'Reporte GRS (Documentos)', 'ITEM',      'FileSearch',  '/activos/consulta-documentos',NULL, 'Consulta de expedientes y documentos', TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000034', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CONFIGURACIONES', 'Configuraciones',          'AGRUPADOR', 'FolderTree',  NULL,                          NULL, 'Tipologías y atributos de activos',    TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000341', 'e0000000-0000-4000-a000-000000000034',                       'MENU_ACTIVOS_CATEGORIAS',      'Categorías de activo',     'ITEM',      'FolderTree',  '/categorias',                 NULL, 'Categorías principales',               TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000342', 'e0000000-0000-4000-a000-000000000034',                       'MENU_ACTIVOS_TIPOS',           'Tipos de activo',          'ITEM',      'Tags',        '/tipos-activo',               NULL, 'Tipos específicos y plantillas',       TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000343', 'e0000000-0000-4000-a000-000000000034',                       'MENU_ACTIVOS_ACCESORIOS',      'Accesorios',               'ITEM',      'Paperclip',   '/accesorios',                 NULL, 'Accesorios y complementos',            TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000344', 'e0000000-0000-4000-a000-000000000034',                       'MENU_ACTIVOS_TIPOS_DOCUMENTO', 'Tipos de documento',       'ITEM',      'FileText',    '/tipos-documento',            NULL, 'Clasificación documental',             TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 4. Menús de INVENTARIOS (Hijos de MOD_INVENTARIOS)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000041', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_INVENTARIOS'), 'MENU_INVENTARIOS_INSUMOS',         'Insumos',             'ITEM',      'List',       '/inventarios',              NULL, 'Registro y stock de insumos',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000042', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_INVENTARIOS'), 'MENU_INVENTARIOS_CONFIGURACIONES', 'Configuraciones',     'AGRUPADOR', 'FolderTree', NULL,                        NULL, 'Clasificación de insumos',           TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000421', 'e0000000-0000-4000-a000-000000000042',                           'MENU_INVENTARIOS_TIPOS_INSUMO',     'Tipos de insumo',     'ITEM',      'Tags',       '/inventarios/tipos-insumo', NULL, 'Tipologías de insumo',               TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000422', 'e0000000-0000-4000-a000-000000000042',                           'MENU_INVENTARIOS_CATEGORIAS',       'Categorías Insumo',   'ITEM',      'FolderTree', '/inventarios/categorias',   NULL, 'Categorías de insumo',             TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 5. Menús de GESTIÓN VEHICULAR (Hijos de MOD_GESTION_VEHICULAR)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000081', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_CONDUCTORES', 'Conductores', 'ITEM', 'UserCheck', '/gestion-vehicular/conductores', NULL, 'Padrón y licencias de conductores', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 6. Menús de MANTENIMIENTO (Hijos de MOD_MANTENIMIENTOS)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000061', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_SOLICITUDES',     'Solicitudes',             'ITEM',      'FileText',    '/mantenimientos/solicitudes',         NULL, 'Registro y seguimiento de solicitudes', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000062', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_APROBACIONES',    'Aprobar Solicitudes',     'ITEM',      'ShieldCheck', '/mantenimientos/aprobaciones',         NULL, 'Bandeja de aprobación de solicitudes',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000063', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ENCARGADO',       'Encargado Mantenimiento', 'ITEM',      'UserCheck',   '/mantenimientos/encargado',            NULL, 'Gestión de órdenes para encargados',    TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000064', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_SUPERVISOR',      'Supervisor Mantenimiento','ITEM',      'ShieldAlert', '/mantenimientos/supervisor',           NULL, 'Control y supervisión de trabajos',     TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000068', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ORDENES_TRABAJO', 'Órdenes de Trabajo',      'ITEM',      'CheckSquare', '/mantenimientos/ordenes-trabajo',      NULL, 'Órdenes de trabajo operativas',         TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000069', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_CONTROLES',       'Control de Activos',      'ITEM',      'FileCheck',   '/mantenimientos/controles-activos',    NULL, 'Inspección y control de equipos',       TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000065', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ACTIVIDADES',     'Actividades',             'ITEM',      'ListTodo',    '/mantenimientos/actividades',          NULL, 'Catálogo de actividades y tareas',      TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000067', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_CONFIGURACIONES', 'Configuraciones',         'AGRUPADOR', 'Settings2',   NULL,                                  NULL, 'Ajustes del módulo de mantenimiento',    TRUE, 8, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000671', 'e0000000-0000-4000-a000-000000000067',                               'MENU_MANT_TIPOS',            'Tipos de Mantenimiento',  'ITEM',      'Tags',        '/mantenimientos/tipos-mantenimiento', NULL, 'Definición de tipos de mantenimiento', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000672', 'e0000000-0000-4000-a000-000000000067',                               'MENU_MANT_PRIORIDADES',      'Prioridades',             'ITEM',      'AlertCircle', '/mantenimientos/prioridades',        NULL, 'Prioridades de atención',             TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 7. Menús de PARÁMETROS (Hijos de MOD_PARAMETROS)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000051', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_GESTION',         'Gestión',             'ITEM',      'SlidersHorizontal', '/parametros/gestion',        NULL, 'Gestión de períodos y ejercicios',    TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000052', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_CATALOGOS',        'Catálogos',           'ITEM',      'BookOpen',          '/parametros/catalogos',      NULL, 'Tablas maestras del sistema',         TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000053', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_CONFIGURACIONES', 'Configuraciones',     'AGRUPADOR', 'Settings2',         NULL,                         NULL, 'Ajustes de datos y mediciones',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000531', 'e0000000-0000-4000-a000-000000000053',                           'MENU_PARAMETROS_TIPOS_DATO',      'Tipos de datos',      'ITEM',      'Type',              '/parametros/tipos-dato',     NULL, 'Definición de tipos de dato dinámico',TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000532', 'e0000000-0000-4000-a000-000000000053',                           'MENU_PARAMETROS_UBICACIONES',     'Ubicaciones',         'ITEM',      'MapPin',            '/parametros/ubicaciones',    NULL, 'Plantas, centrales y ubicaciones',    TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000533', 'e0000000-0000-4000-a000-000000000053',                           'MENU_PARAMETROS_UNIDADES_MEDIDA', 'Unidades de medida',  'ITEM',      'Ruler',             '/parametros/unidades-medida',NULL, 'Unidades de medida estandarizadas',   TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 8. Menús de SEGURIDAD (Hijos de MOD_SEGURIDAD)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000071', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_USUARIOS', 'Usuarios', 'ITEM', 'Users',       '/seguridad/usuarios', NULL, 'Cuentas de usuario y accesos',      TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000072', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_ROLES',    'Roles',    'ITEM', 'ShieldCheck', '/seguridad/roles',    NULL, 'Perfiles y asignación de permisos', TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000073', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_MENUS',    'Menús',    'ITEM', 'FolderTree',  '/seguridad/menus',    NULL, 'Árbol de navegación y rutas',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- 9. Reasignación explícita de padres para garantizar integridad total
UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION')
WHERE codigo IN (
    'MENU_ORG_EMPLEADOS', 'MENU_ORG_AREAS', 'MENU_ORG_CARGOS', 'MENU_ORG_PERSONAS',
    'MENU_ORG_RESPONSABILIDADES', 'MENU_ORG_GRUPOS_APROBADORES', 'MENU_ORG_MIGRACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS')
WHERE codigo IN (
    'MENU_ACTIVOS_REGISTRO', 'MENU_ACTIVOS_CATALOGO', 'MENU_ACTIVOS_CONSULTA_DOCS', 'MENU_ACTIVOS_CONFIGURACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES')
WHERE codigo IN (
    'MENU_ACTIVOS_CATEGORIAS', 'MENU_ACTIVOS_TIPOS', 'MENU_ACTIVOS_ACCESORIOS', 'MENU_ACTIVOS_TIPOS_DOCUMENTO'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_INVENTARIOS')
WHERE codigo IN (
    'MENU_INVENTARIOS_INSUMOS', 'MENU_INVENTARIOS_CONFIGURACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_INVENTARIOS_CONFIGURACIONES')
WHERE codigo IN (
    'MENU_INVENTARIOS_TIPOS_INSUMO', 'MENU_INVENTARIOS_CATEGORIAS'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR')
WHERE codigo IN (
    'MENU_VEH_CONDUCTORES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS')
WHERE codigo IN (
    'MENU_MANT_SOLICITUDES', 'MENU_MANT_APROBACIONES', 'MENU_MANT_ENCARGADO', 'MENU_MANT_SUPERVISOR',
    'MENU_MANT_ORDENES_TRABAJO', 'MENU_MANT_CONTROLES', 'MENU_MANT_ACTIVIDADES', 'MENU_MANT_CONFIGURACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_MANT_CONFIGURACIONES')
WHERE codigo IN (
    'MENU_MANT_TIPOS', 'MENU_MANT_PRIORIDADES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS')
WHERE codigo IN (
    'MENU_PARAMETROS_GESTION', 'MENU_PARAMETROS_CATALOGOS', 'MENU_PARAMETROS_CONFIGURACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_PARAMETROS_CONFIGURACIONES')
WHERE codigo IN (
    'MENU_PARAMETROS_TIPOS_DATO', 'MENU_PARAMETROS_UBICACIONES', 'MENU_PARAMETROS_UNIDADES_MEDIDA'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD')
WHERE codigo IN (
    'MENU_SEG_USUARIOS', 'MENU_SEG_ROLES', 'MENU_SEG_MENUS'
);

-- 10. Asignar todos los menús y módulos activos al rol ADMIN / ROLE_ADMIN
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
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;
