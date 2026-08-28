-- ============================================================================
-- Seed: Módulo Seguridad - Menús de Navegación del Sistema (nav.config.ts)
-- Estructura jerárquica con Nivel de Módulos (Raíz) e Iconos Lucide-React
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Módulos del Sistema (Nivel 1 - Raíz: Módulos)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('d0000000-0000-4000-a000-000000000001', NULL, 'MOD_INICIO',         'Módulo Inicio',         NULL, NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000002', NULL, 'MOD_ORGANIZACION',   'Módulo Organización',   NULL, NULL, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000003', NULL, 'MOD_ACTIVOS',        'Módulo Activos',        NULL, NULL, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000004', NULL, 'MOD_INVENTARIOS',    'Módulo Inventarios',    NULL, NULL, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000005', NULL, 'MOD_PARAMETROS',     'Módulo Parámetros',     NULL, NULL, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000006', NULL, 'MOD_MANTENIMIENTOS', 'Módulo Mantenimientos', NULL, NULL, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000007', NULL, 'MOD_SEGURIDAD',      'Módulo Seguridad',      NULL, NULL, 7, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 2. Menús Principales (Nivel 2 - Agrupadores por Módulo)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001', 'MENU_INICIO',         'Inicio',         'LayoutDashboard', NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000002', 'MENU_ORGANIZACION',   'Organización',   'Building2',       NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS',        'Activos',        'Boxes',           NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000004', 'MENU_INVENTARIOS',    'Inventarios',    'Boxes',           NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000005', 'MENU_PARAMETROS',     'Parámetros',     'Settings2',       NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000006', 'MENU_MANTENIMIENTOS', 'Mantenimientos', 'Wrench',          NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000007', 'MENU_SEGURIDAD',      'Seguridad',      'Shield',          NULL, 1, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 3. Submenús de Organización (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000021', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_EMPLEADOS',          'Empleados',          'UserCheck',   '/organizacion/empleados',          1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000022', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_AREAS',              'Áreas',              'Building',    '/organizacion/areas',              2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000023', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_CARGOS',             'Cargos',             'Briefcase',   '/organizacion/cargos',             3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000024', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_PERSONAS',           'Personas',           'Users',       '/organizacion/personas',           4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000025', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_RESPONSABILIDADES',  'Responsabilidades',  'Award',       '/organizacion/responsabilidades',  5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000026', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_GRUPOS_APROBADORES', 'Grupos Aprobadores', 'ShieldCheck', '/organizacion/grupos-aprobadores', 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000027', 'e0000000-0000-4000-a000-000000000002', 'MENU_ORG_MANTENIMIENTO',      'Mantenimiento',      'ScrollText',  NULL,                                7, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- Nivel 4 (Hijo de Subgrupo Mantenimiento en Organización)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000271', 'e0000000-0000-4000-a000-000000000027', 'MENU_ORG_MIGRACIONES', 'Logs de Migración', 'ScrollText', '/organizacion/migraciones', 1, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 4. Submenús de Activos (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000031', 'e0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_REGISTRO',       'Registro de Activos',        'Boxes',       '/activos',                    1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000032', 'e0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CATALOGO',       'Catálogo de Activos',        'LayoutGrid',  '/activos/catalogo',           2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000033', 'e0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CONSULTA_DOCS',  'Reporte GRS (Documentos)',   'FileSearch',  '/activos/consulta-documentos',3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000034', 'e0000000-0000-4000-a000-000000000003', 'MENU_ACTIVOS_CONFIGURACIONES', 'Configuraciones',            'FolderTree',  NULL,                          4, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- Nivel 4 (Hijos de Subgrupo Configuraciones en Activos)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000341', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_CATEGORIAS',      'Categorías de activo', 'FolderTree', '/categorias',      1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000342', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_TIPOS',           'Tipos de activo',      'Tags',       '/tipos-activo',    2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000343', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_ACCESORIOS',      'Accesorios',           'Paperclip',  '/accesorios',      3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000344', 'e0000000-0000-4000-a000-000000000034', 'MENU_ACTIVOS_TIPOS_DOCUMENTO', 'Tipos de documento',   'FileText',   '/tipos-documento', 4, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 5. Submenús de Inventarios (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000041', 'e0000000-0000-4000-a000-000000000004', 'MENU_INVENTARIOS_INSUMOS',         'Insumos',         'List',       '/inventarios', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000042', 'e0000000-0000-4000-a000-000000000004', 'MENU_INVENTARIOS_CONFIGURACIONES', 'Configuraciones', 'FolderTree', NULL,           2, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- Nivel 4 (Hijos de Subgrupo Configuraciones en Inventarios)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000421', 'e0000000-0000-4000-a000-000000000042', 'MENU_INVENTARIOS_TIPOS_INSUMO', 'Tipos de insumo',   'Tags',       '/inventarios/tipos-insumo', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000422', 'e0000000-0000-4000-a000-000000000042', 'MENU_INVENTARIOS_CATEGORIAS',   'Categorías Insumo', 'FolderTree', '/inventarios/categorias',   2, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 6. Submenús de Parámetros (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000051', 'e0000000-0000-4000-a000-000000000005', 'MENU_PARAMETROS_GESTION',         'Gestión',         'SlidersHorizontal', '/parametros/gestion', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000052', 'e0000000-0000-4000-a000-000000000005', 'MENU_PARAMETROS_CATALOGOS',        'Catálogos',       'BookOpen',          '/parametros/catalogos', 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000053', 'e0000000-0000-4000-a000-000000000005', 'MENU_PARAMETROS_CONFIGURACIONES', 'Configuraciones',  'Settings2',         NULL,                    3, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- Nivel 4 (Hijos de Subgrupo Configuraciones en Parámetros)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000531', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_TIPOS_DATO',      'Tipos de datos',     'Type',   '/parametros/tipos-dato',      1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000532', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_UBICACIONES',     'Ubicaciones',        'MapPin', '/parametros/ubicaciones',     2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000533', 'e0000000-0000-4000-a000-000000000053', 'MENU_PARAMETROS_UNIDADES_MEDIDA', 'Unidades de medida', 'Ruler',  '/parametros/unidades-medida', 3, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 7. Submenús de Mantenimientos (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000061', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_SOLICITUDES',      'Solicitudes',             'FileText',    '/mantenimientos/solicitudes', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000062', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_APROBACIONES',     'Aprobar Solicitudes',     'ShieldCheck', '/mantenimientos/aprobaciones', 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000063', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_ENCARGADO',        'Encargado Mantenimiento', 'UserCheck',   '/mantenimientos/encargado',    3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000064', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_SUPERVISOR',       'Supervisor Mantenimiento','ShieldAlert', '/mantenimientos/supervisor',   4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000065', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_ACTIVIDADES',      'Actividades',             'ListTodo',    '/mantenimientos/actividades',  5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000066', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_CHECKLISTS',        'Checklists',              'CheckSquare', '/mantenimientos/checklists',   6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000067', 'e0000000-0000-4000-a000-000000000006', 'MENU_MANT_CONFIGURACIONES',  'Configuraciones',         'FolderTree',  NULL,                           7, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- Nivel 4 (Hijos de Subgrupo Configuraciones en Mantenimientos)
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000671', 'e0000000-0000-4000-a000-000000000067', 'MENU_MANT_TIPOS',       'Tipos de Mantenimiento', 'Tags',        '/mantenimientos/tipos-mantenimiento', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000672', 'e0000000-0000-4000-a000-000000000067', 'MENU_MANT_PRIORIDADES', 'Prioridades',            'AlertCircle', '/mantenimientos/prioridades',           2, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';

-- ---------------------------------------------------------------------------
-- 8. Submenús de Seguridad (Nivel 3)
-- ---------------------------------------------------------------------------
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, icono, ruta, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000071', 'e0000000-0000-4000-a000-000000000007', 'MENU_SEG_USUARIOS', 'Usuarios', 'Users',       '/seguridad/usuarios', 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000072', 'e0000000-0000-4000-a000-000000000007', 'MENU_SEG_ROLES',    'Roles',    'ShieldCheck', '/seguridad/roles',    2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000073', 'e0000000-0000-4000-a000-000000000007', 'MENU_SEG_MENUS',    'Menús',    'FolderTree',  '/seguridad/menus',    3, TRUE, NOW(), NOW(), 'seed', 'seed')
ON CONFLICT (codigo) DO UPDATE SET
    menu_padre_id = EXCLUDED.menu_padre_id,
    nombre        = EXCLUDED.nombre,
    icono         = EXCLUDED.icono,
    ruta          = EXCLUDED.ruta,
    orden         = EXCLUDED.orden,
    activo        = EXCLUDED.activo,
    updated_at    = NOW(),
    updated_by    = 'seed';
