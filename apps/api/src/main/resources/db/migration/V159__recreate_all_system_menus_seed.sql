-- ============================================================================
-- Migración: V159__recreate_all_system_menus_seed.sql
-- Descripción: Recreación y sincronización total del catálogo de Menús del Sistema
--              y asignación completa de permisos a roles.
--              - Sobrescribe rutas, nombres, iconos, colores, orden y jerarquía.
--              - Elimina menús obsoletos no pertenecientes a la arquitectura actual.
--              - Asigna todos los menús al rol ADMIN / ROLE_ADMIN.
--              - Asigna menús específicos a roles operativos.
-- ============================================================================

-- 1. Eliminar referencias huérfanas u obsoletas que no pertenecen al catálogo oficial de 66 menús
DELETE FROM seguridad.roles_menus
WHERE menu_id IN (
    SELECT id FROM seguridad.menus
    WHERE codigo NOT IN (
        'MOD_INICIO',
        'MOD_ORGANIZACION',
        'MENU_ORG_EMPLEADOS',
        'MENU_ORG_AREAS',
        'MENU_ORG_CARGOS',
        'MENU_ORG_PERSONAS',
        'MENU_ORG_RESPONSABILIDADES',
        'MENU_ORG_GRUPOS_APROBADORES',
        'MENU_ORG_MIGRACIONES',
        'MOD_ACTIVOS',
        'MENU_ACTIVOS_REGISTRO',
        'MENU_ACTIVOS_CATALOGO',
        'MENU_ACTIVOS_CONSULTA_DOCS',
        'MENU_ACTIVOS_DISPONIBILIDAD',
        'MENU_ACTIVOS_CONFIGURACIONES',
        'MENU_ACTIVOS_CATEGORIAS',
        'MENU_ACTIVOS_TIPOS',
        'MENU_ACTIVOS_ACCESORIOS',
        'MENU_ACTIVOS_TIPOS_DOCUMENTO',
        'MENU_ACTIVOS_ESTADOS_OPERATIVOS',
        'MOD_INVENTARIOS',
        'MENU_INVENTARIOS_INSUMOS',
        'MENU_INVENTARIOS_CONFIGURACIONES',
        'MENU_INVENTARIOS_TIPOS_INSUMO',
        'MENU_INVENTARIOS_CATEGORIAS',
        'MOD_GESTION_VEHICULAR',
        'MENU_VEH_DASHBOARD',
        'MENU_VEH_SOLICITUDES',
        'MENU_VEH_ASIGNACIONES',
        'MENU_VEH_SALIDAS',
        'MENU_VEH_MIS_VIAJES',
        'MENU_VEH_CALENDARIO_RESERVAS',
        'MENU_CONFIGURACIONES_GESTION_VEHICULAR',
        'MENU_VEH_CONDUCTORES',
        'MENU_VEH_FLOTAS',
        'MENU_VEH_TIPOS_SOLICITUD',
        'REPORTES_GESTION_VEHICULAR',
        'MENU_VEH_HISTORIAL_VIAJES',
        'MENU_VEH_CONSUMO_COMBUSTIBLE',
        'MENU_VEH_BITACORA',
        'MENU_VEH_REP_SALIDAS',
        'MOD_MANTENIMIENTOS',
        'MENU_MANT_SOLICITUDES',
        'MENU_MANT_APROBACIONES',
        'MENU_MANT_ENCARGADO',
        'MENU_MANT_SUPERVISOR',
        'MENU_MANT_ORDENES_TRABAJO',
        'MENU_MANT_CONTROLES',
        'MENU_MANT_ACTIVIDADES',
        'MENU_MANT_PLANES',
        'MENU_MANT_PROGRAMACIONES',
        'MENU_MANT_CONFIGURACIONES',
        'MENU_MANT_TIPOS',
        'MENU_MANT_PRIORIDADES',
        'MOD_PARAMETROS',
        'MENU_PARAMETROS_GESTION',
        'MENU_PARAMETROS_CATALOGOS',
        'MENU_PARAMETROS_CONFIGURACIONES',
        'MENU_PARAMETROS_TIPOS_DATO',
        'MENU_PARAMETROS_UBICACIONES',
        'MENU_PARAMETROS_UNIDADES_MEDIDA',
        'MOD_SEGURIDAD',
        'MENU_SEG_USUARIOS',
        'MENU_SEG_ROLES',
        'MENU_SEG_MENUS',
        'MENU_SEG_PERMISOS'
    )
);

DELETE FROM seguridad.permisos
WHERE menu_id IN (
    SELECT id FROM seguridad.menus
    WHERE codigo NOT IN (
        'MOD_INICIO',
        'MOD_ORGANIZACION',
        'MENU_ORG_EMPLEADOS',
        'MENU_ORG_AREAS',
        'MENU_ORG_CARGOS',
        'MENU_ORG_PERSONAS',
        'MENU_ORG_RESPONSABILIDADES',
        'MENU_ORG_GRUPOS_APROBADORES',
        'MENU_ORG_MIGRACIONES',
        'MOD_ACTIVOS',
        'MENU_ACTIVOS_REGISTRO',
        'MENU_ACTIVOS_CATALOGO',
        'MENU_ACTIVOS_CONSULTA_DOCS',
        'MENU_ACTIVOS_DISPONIBILIDAD',
        'MENU_ACTIVOS_CONFIGURACIONES',
        'MENU_ACTIVOS_CATEGORIAS',
        'MENU_ACTIVOS_TIPOS',
        'MENU_ACTIVOS_ACCESORIOS',
        'MENU_ACTIVOS_TIPOS_DOCUMENTO',
        'MENU_ACTIVOS_ESTADOS_OPERATIVOS',
        'MOD_INVENTARIOS',
        'MENU_INVENTARIOS_INSUMOS',
        'MENU_INVENTARIOS_CONFIGURACIONES',
        'MENU_INVENTARIOS_TIPOS_INSUMO',
        'MENU_INVENTARIOS_CATEGORIAS',
        'MOD_GESTION_VEHICULAR',
        'MENU_VEH_DASHBOARD',
        'MENU_VEH_SOLICITUDES',
        'MENU_VEH_ASIGNACIONES',
        'MENU_VEH_SALIDAS',
        'MENU_VEH_MIS_VIAJES',
        'MENU_VEH_CALENDARIO_RESERVAS',
        'MENU_CONFIGURACIONES_GESTION_VEHICULAR',
        'MENU_VEH_CONDUCTORES',
        'MENU_VEH_FLOTAS',
        'MENU_VEH_TIPOS_SOLICITUD',
        'REPORTES_GESTION_VEHICULAR',
        'MENU_VEH_HISTORIAL_VIAJES',
        'MENU_VEH_CONSUMO_COMBUSTIBLE',
        'MENU_VEH_BITACORA',
        'MENU_VEH_REP_SALIDAS',
        'MOD_MANTENIMIENTOS',
        'MENU_MANT_SOLICITUDES',
        'MENU_MANT_APROBACIONES',
        'MENU_MANT_ENCARGADO',
        'MENU_MANT_SUPERVISOR',
        'MENU_MANT_ORDENES_TRABAJO',
        'MENU_MANT_CONTROLES',
        'MENU_MANT_ACTIVIDADES',
        'MENU_MANT_PLANES',
        'MENU_MANT_PROGRAMACIONES',
        'MENU_MANT_CONFIGURACIONES',
        'MENU_MANT_TIPOS',
        'MENU_MANT_PRIORIDADES',
        'MOD_PARAMETROS',
        'MENU_PARAMETROS_GESTION',
        'MENU_PARAMETROS_CATALOGOS',
        'MENU_PARAMETROS_CONFIGURACIONES',
        'MENU_PARAMETROS_TIPOS_DATO',
        'MENU_PARAMETROS_UBICACIONES',
        'MENU_PARAMETROS_UNIDADES_MEDIDA',
        'MOD_SEGURIDAD',
        'MENU_SEG_USUARIOS',
        'MENU_SEG_ROLES',
        'MENU_SEG_MENUS',
        'MENU_SEG_PERMISOS'
    )
);

DELETE FROM seguridad.menus
WHERE codigo NOT IN (
    'MOD_INICIO',
    'MOD_ORGANIZACION',
    'MENU_ORG_EMPLEADOS',
    'MENU_ORG_AREAS',
    'MENU_ORG_CARGOS',
    'MENU_ORG_PERSONAS',
    'MENU_ORG_RESPONSABILIDADES',
    'MENU_ORG_GRUPOS_APROBADORES',
    'MENU_ORG_MIGRACIONES',
    'MOD_ACTIVOS',
    'MENU_ACTIVOS_REGISTRO',
    'MENU_ACTIVOS_CATALOGO',
    'MENU_ACTIVOS_CONSULTA_DOCS',
    'MENU_ACTIVOS_DISPONIBILIDAD',
    'MENU_ACTIVOS_CONFIGURACIONES',
    'MENU_ACTIVOS_CATEGORIAS',
    'MENU_ACTIVOS_TIPOS',
    'MENU_ACTIVOS_ACCESORIOS',
    'MENU_ACTIVOS_TIPOS_DOCUMENTO',
    'MENU_ACTIVOS_ESTADOS_OPERATIVOS',
    'MOD_INVENTARIOS',
    'MENU_INVENTARIOS_INSUMOS',
    'MENU_INVENTARIOS_CONFIGURACIONES',
    'MENU_INVENTARIOS_TIPOS_INSUMO',
    'MENU_INVENTARIOS_CATEGORIAS',
    'MOD_GESTION_VEHICULAR',
    'MENU_VEH_DASHBOARD',
    'MENU_VEH_SOLICITUDES',
    'MENU_VEH_ASIGNACIONES',
    'MENU_VEH_SALIDAS',
    'MENU_VEH_MIS_VIAJES',
    'MENU_VEH_CALENDARIO_RESERVAS',
    'MENU_CONFIGURACIONES_GESTION_VEHICULAR',
    'MENU_VEH_CONDUCTORES',
    'MENU_VEH_FLOTAS',
    'MENU_VEH_TIPOS_SOLICITUD',
    'REPORTES_GESTION_VEHICULAR',
    'MENU_VEH_HISTORIAL_VIAJES',
    'MENU_VEH_CONSUMO_COMBUSTIBLE',
    'MENU_VEH_BITACORA',
    'MENU_VEH_REP_SALIDAS',
    'MOD_MANTENIMIENTOS',
    'MENU_MANT_SOLICITUDES',
    'MENU_MANT_APROBACIONES',
    'MENU_MANT_ENCARGADO',
    'MENU_MANT_SUPERVISOR',
    'MENU_MANT_ORDENES_TRABAJO',
    'MENU_MANT_CONTROLES',
    'MENU_MANT_ACTIVIDADES',
    'MENU_MANT_PLANES',
    'MENU_MANT_PROGRAMACIONES',
    'MENU_MANT_CONFIGURACIONES',
    'MENU_MANT_TIPOS',
    'MENU_MANT_PRIORIDADES',
    'MOD_PARAMETROS',
    'MENU_PARAMETROS_GESTION',
    'MENU_PARAMETROS_CATALOGOS',
    'MENU_PARAMETROS_CONFIGURACIONES',
    'MENU_PARAMETROS_TIPOS_DATO',
    'MENU_PARAMETROS_UBICACIONES',
    'MENU_PARAMETROS_UNIDADES_MEDIDA',
    'MOD_SEGURIDAD',
    'MENU_SEG_USUARIOS',
    'MENU_SEG_ROLES',
    'MENU_SEG_MENUS',
    'MENU_SEG_PERMISOS'
);

-- ============================================================================
-- 2. Módulos Raíz (Nivel 1 - tipo MODULO)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('d0000000-0000-4000-a000-000000000001', NULL, 'MOD_INICIO',            'Inicio',            'MODULO', 'LayoutDashboard', '#3B82F6', '/',     NULL, 'Página de inicio y resumen general',    TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000002', NULL, 'MOD_ORGANIZACION',      'Organización',      'MODULO', 'Building2',       '#8B5CF6', NULL,    NULL, 'Estructura empresarial y personal',     TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000003', NULL, 'MOD_ACTIVOS',           'Activos',           'MODULO', 'Boxes',           '#10B981', NULL,    NULL, 'Catálogo y control de activos',         TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000004', NULL, 'MOD_INVENTARIOS',       'Inventarios',       'MODULO', 'Package',         '#F59E0B', NULL,    NULL, 'Insumos y repuestos',                   TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('21fe8cbb-4e37-4d03-b8c9-68b317d76869', NULL, 'MOD_GESTION_VEHICULAR', 'Gestión Vehicular','MODULO', 'Truck',           '#06B6D4', NULL,    NULL, 'Control de flota, conductores y viajes', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000006', NULL, 'MOD_MANTENIMIENTOS',    'Mantenimiento',     'MODULO', 'Wrench',          '#EC4899', NULL,    NULL, 'Gestión operativa de mantenimiento',     TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000005', NULL, 'MOD_PARAMETROS',        'Parámetros',        'MODULO', 'Settings2',       '#64748B', NULL,    NULL, 'Parámetros y configuraciones base',     TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('d0000000-0000-4000-a000-000000000007', NULL, 'MOD_SEGURIDAD',         'Seguridad',         'MODULO', 'Shield',          '#EF4444', NULL,    NULL, 'Control de accesos, roles y menús',     TRUE, 8, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 3. Menús de ORGANIZACIÓN (Hijos de MOD_ORGANIZACION)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000021', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_EMPLEADOS',          'Empleados',          'ITEM', 'UserCheck',   '#8B5CF6', '/organizacion/empleados',          NULL, 'Nómina y ficha de empleados',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000022', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_AREAS',              'Áreas',              'ITEM', 'Building',    '#8B5CF6', '/organizacion/areas',              NULL, 'Estructura organizacional y áreas',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000023', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_CARGOS',             'Cargos',             'ITEM', 'Briefcase',   '#8B5CF6', '/organizacion/cargos',             NULL, 'Puestos y cargos laborales',         TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000024', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_PERSONAS',           'Personas',           'ITEM', 'Users',       '#8B5CF6', '/organizacion/personas',           NULL, 'Registro general de personas',       TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000025', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_RESPONSABILIDADES',  'Responsabilidades',  'ITEM', 'Award',       '#8B5CF6', '/organizacion/responsabilidades',  NULL, 'Roles y responsabilidades internas', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000026', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_GRUPOS_APROBADORES', 'Grupos Aprobadores', 'ITEM', 'ShieldCheck', '#8B5CF6', '/organizacion/grupos-aprobadores', NULL, 'Flujos y niveles de aprobación',     TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000271', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION'), 'MENU_ORG_MIGRACIONES',        'Logs de Migración',  'ITEM', 'ScrollText',  '#8B5CF6', '/organizacion/migraciones',        NULL, 'Historial y registros de migración', TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 4. Menús de ACTIVOS (Hijos de MOD_ACTIVOS)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000031', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_REGISTRO',       'Registro de Activos',      'ITEM',      'Boxes',      '#10B981', '/activos/registro-activo',                   NULL, 'Gestión y ficha de activos fijos',     TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000032', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CATALOGO',       'Catálogo de Activos',      'ITEM',      'LayoutGrid', '#10B981', '/activos/catalogo',                          NULL, 'Vista de catálogo fotográfico',        TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000033', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CONSULTA_DOCS',  'Reporte GRS (Documentos)', 'ITEM',      'FileSearch', '#10B981', '/activos/consulta-documentos',               NULL, 'Consulta de expedientes y documentos', TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000035', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_DISPONIBILIDAD', 'Disponibilidad y Estados', 'ITEM',      'Activity',   '#10B981', '/activos/disponibilidad',                  NULL, 'Reporte de disponibilidad técnica y estados operativos', TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000034', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS'), 'MENU_ACTIVOS_CONFIGURACIONES', 'Configuraciones',          'AGRUPADOR', 'FolderTree', '#10B981', NULL,                                         NULL, 'Tipologías y atributos de activos',    TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de MENU_ACTIVOS_CONFIGURACIONES
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000341', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES'), 'MENU_ACTIVOS_CATEGORIAS',         'Categorías de activo', 'ITEM', 'FolderTree', '#10B981', '/activos/configuraciones/categorias-activos', NULL, 'Categorías principales',               TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000342', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES'), 'MENU_ACTIVOS_TIPOS',              'Tipos de activo',      'ITEM', 'Tags',       '#10B981', '/activos/configuraciones/tipos-activo',        NULL, 'Tipos específicos y plantillas',       TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000343', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES'), 'MENU_ACTIVOS_ACCESORIOS',         'Accesorios',           'ITEM', 'Paperclip',  '#10B981', '/activos/configuraciones/accesorios',          NULL, 'Accesorios y complementos',            TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000344', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES'), 'MENU_ACTIVOS_TIPOS_DOCUMENTO',    'Tipos de documento',   'ITEM', 'FileText',   '#10B981', '/activos/configuraciones/tipos-documento',     NULL, 'Clasificación documental',             TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000345', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES'), 'MENU_ACTIVOS_ESTADOS_OPERATIVOS', 'Estados operativos',   'ITEM', 'Activity',   '#10B981', '/activos/configuraciones/estados-operativos',  NULL, 'Catálogo y configuración de estados operativos', TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 5. Menús de INVENTARIOS (Hijos de MOD_INVENTARIOS)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000041', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_INVENTARIOS'), 'MENU_INVENTARIOS_INSUMOS',         'Insumos',         'ITEM',      'List',       '#F59E0B', '/inventarios',              NULL, 'Registro y stock de insumos',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000042', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_INVENTARIOS'), 'MENU_INVENTARIOS_CONFIGURACIONES', 'Configuraciones', 'AGRUPADOR', 'FolderTree', '#F59E0B', NULL,                      NULL, 'Clasificación de insumos',           TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de MENU_INVENTARIOS_CONFIGURACIONES
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000421', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_INVENTARIOS_CONFIGURACIONES'), 'MENU_INVENTARIOS_TIPOS_INSUMO', 'Tipos de insumo',   'ITEM', 'Tags',       '#F59E0B', '/inventarios/tipos-insumo', NULL, 'Tipologías de insumo',   TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000422', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_INVENTARIOS_CONFIGURACIONES'), 'MENU_INVENTARIOS_CATEGORIAS',   'Categorías Insumo', 'ITEM', 'FolderTree', '#F59E0B', '/inventarios/categorias',   NULL, 'Categorías de insumo', TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 6. Menús de GESTIÓN VEHICULAR (Hijos de MOD_GESTION_VEHICULAR)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000092', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_DASHBOARD',                     'Dashboard',                'ITEM',      'LayoutDashboard', '#06B6D4', '/gestion-vehicular/dashboard-gestion-vehicular', NULL, 'Panel de control e indicadores operativos de la flota vehicular', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000083', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_SOLICITUDES',                   'Solicitudes de Vehículos', 'ITEM',      'CarFront',        '#06B6D4', '/gestion-vehicular/solicitudes',                 NULL, 'Gestión y seguimiento de solicitudes de uso de vehículos',        TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000084', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_ASIGNACIONES',                  'Asignación Vehicular',     'ITEM',      'KeyRound',        '#06B6D4', '/gestion-vehicular/asignaciones',                NULL, 'Asignación y entrega de vehículos a solicitudes aprobadas',        TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('41b03000-c5d1-4914-ab18-626daee1b07e', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_SALIDAS',                       'Salidas Vehiculares',      'ITEM',      'Car',             '#06B6D4', '/gestion-vehicular/salidas',                     NULL, 'Control y ciclo de vida de salidas vehiculares BPMN',              TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000085', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_MIS_VIAJES',                     'Mis Viajes',               'ITEM',      'Route',           '#06B6D4', '/gestion-vehicular/mis-viajes',                  NULL, 'Mis viajes asignados, registro de odómetro y estado de viaje',     TRUE, 5, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000087', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_VEH_CALENDARIO_RESERVAS',           'Calendario de Reservas',   'ITEM',      'CalendarDays',    '#06B6D4', '/gestion-vehicular/calendario-reservas',         NULL, 'Visualización del calendario y disponibilidad de reservas',         TRUE, 6, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('0015307b-c0d5-46b7-afc6-a7e8925552ac', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'MENU_CONFIGURACIONES_GESTION_VEHICULAR', 'Configuraciones',        'AGRUPADOR', 'Settings2',       '#06B6D4', NULL,                                             NULL, 'Configuración de conductores, flotas y tipos de solicitud vehicular', TRUE, 7, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('45e3f462-6c41-467b-bc18-36526314b093', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_GESTION_VEHICULAR'), 'REPORTES_GESTION_VEHICULAR',             'Reportes',                 'AGRUPADOR', 'BarChart3',       '#06B6D4', NULL,                                             NULL, 'Reportes e historial de viajes, bitácora y combustible',           TRUE, 8, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de MENU_CONFIGURACIONES_GESTION_VEHICULAR
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000081', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_CONFIGURACIONES_GESTION_VEHICULAR'), 'MENU_VEH_CONDUCTORES',     'Conductores',        'ITEM', 'UserCheck', '#06B6D4', '/gestion-vehicular/configuraciones/conductores',     NULL, 'Padrón y licencias de conductores',                TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000086', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_CONFIGURACIONES_GESTION_VEHICULAR'), 'MENU_VEH_FLOTAS',          'Flotas Vehiculares', 'ITEM', 'Car',       '#06B6D4', '/gestion-vehicular/configuraciones/flotas',          NULL, 'Gestión de flotas y asignación de vehículos',       TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000082', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_CONFIGURACIONES_GESTION_VEHICULAR'), 'MENU_VEH_TIPOS_SOLICITUD', 'Tipos de Solicitud', 'ITEM', 'Tags',      '#06B6D4', '/gestion-vehicular/configuraciones/tipos-solicitud', NULL, 'Catálogo de tipos de solicitud vehicular',        TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de REPORTES_GESTION_VEHICULAR
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000089', (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR'), 'MENU_VEH_HISTORIAL_VIAJES',    'Historial de Viajes',    'ITEM', 'History',   '#06B6D4', '/gestion-vehicular/reportes/historial-viajes',    NULL, 'Consulta y reporte de historial de viajes vehiculares',        TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000090', (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR'), 'MENU_VEH_CONSUMO_COMBUSTIBLE', 'Consumo de Combustible', 'ITEM', 'Fuel',      '#06B6D4', '/gestion-vehicular/reportes/consumo-combustible', NULL, 'Reporte y seguimiento de consumos y cargas de combustible',  TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000088', (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR'), 'MENU_VEH_BITACORA',            'Bitácora Vehicular',     'ITEM', 'BookOpen',  '#06B6D4', '/gestion-vehicular/reportes/bitacora',            NULL, 'Bitácora detallada de operaciones y eventos vehiculares',    TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('22fc07b6-8150-4869-919c-a9b722373515', (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR'), 'MENU_VEH_REP_SALIDAS',         'Salidas Vehiculares',    'ITEM', 'BarChart3', '#06B6D4', '/gestion-vehicular/reportes/salidas-vehiculares',   NULL, 'Reporte consolidado de salidas, kilometrajes y bitácoras',     TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 7. Menús de MANTENIMIENTO (Hijos de MOD_MANTENIMIENTOS)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000061', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_SOLICITUDES',     'Solicitudes Mantenimiento', 'ITEM',      'FileText',      '#EC4899', '/mantenimientos/solicitudes',                   NULL, 'Registro y seguimiento de solicitudes de mantenimiento',             TRUE, 1,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000062', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_APROBACIONES',    'Aprobar Solicitudes',       'ITEM',      'ShieldCheck',   '#EC4899', '/mantenimientos/aprobaciones',                  NULL, 'Bandeja de aprobación de solicitudes',                              TRUE, 2,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000063', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ENCARGADO',       'Encargado Mantenimiento',   'ITEM',      'UserCheck',     '#EC4899', '/mantenimientos/encargado',                     NULL, 'Gestión de órdenes para encargados',                                TRUE, 3,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000064', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_SUPERVISOR',      'Supervisor Mantenimiento',  'ITEM',      'ShieldAlert',   '#EC4899', '/mantenimientos/supervisor',                    NULL, 'Control y supervisión de trabajos',                                 TRUE, 4,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000068', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ORDENES_TRABAJO', 'Órdenes de Trabajo',        'ITEM',      'CheckSquare',   '#EC4899', '/mantenimientos/ordenes-trabajo',               NULL, 'Órdenes de trabajo operativas',                                     TRUE, 5,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000069', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_CONTROLES',       'Control de Activos',        'ITEM',      'FileCheck',     '#EC4899', '/mantenimientos/controles-activos',             NULL, 'Inspección y control de equipos',                                   TRUE, 6,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000065', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_ACTIVIDADES',     'Actividades',               'ITEM',      'ListTodo',      '#EC4899', '/mantenimientos/actividades',                   NULL, 'Catálogo de actividades y tareas',                                  TRUE, 7,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000066', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_PLANES',          'Planes de Mantenimiento',   'ITEM',      'ClipboardList', '#3B82F6', '/mantenimientos/planes-mantenimiento',        NULL, 'Catálogo y gestión de planes de mantenimiento preventivo',          TRUE, 8,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('fe7cd10d-bf5e-4b79-b383-c7425c8ac442', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_PROGRAMACIONES',  'Programaciones',            'ITEM',      'CalendarClock', '#F59E0B', '/mantenimientos/programaciones-mantenimiento', NULL, 'Programaciones de mantenimiento preventivo',                    TRUE, 9,  TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000067', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS'), 'MENU_MANT_CONFIGURACIONES', 'Configuraciones',           'AGRUPADOR', 'Settings2',     '#EC4899', NULL,                                           NULL, 'Ajustes del módulo de mantenimiento',                                TRUE, 10, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de MENU_MANT_CONFIGURACIONES
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000671', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_MANT_CONFIGURACIONES'), 'MENU_MANT_TIPOS',       'Tipos de Mantenimiento', 'ITEM', 'Tags',        '#EC4899', '/mantenimientos/tipos-mantenimiento', NULL, 'Definición de tipos de mantenimiento', TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000672', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_MANT_CONFIGURACIONES'), 'MENU_MANT_PRIORIDADES', 'Prioridades',            'ITEM', 'AlertCircle', '#EC4899', '/mantenimientos/prioridades',           NULL, 'Prioridades de atención',             TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 8. Menús de PARÁMETROS (Hijos de MOD_PARAMETROS)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000051', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_GESTION',         'Gestión',         'ITEM',      'SlidersHorizontal', '#64748B', '/parametros/gestion',   NULL, 'Gestión de períodos y ejercicios',    TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000052', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_CATALOGOS',        'Catálogos',       'ITEM',      'BookOpen',          '#64748B', '/parametros/catalogos', NULL, 'Tablas maestras del sistema',         TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000053', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_PARAMETROS'), 'MENU_PARAMETROS_CONFIGURACIONES', 'Configuraciones', 'AGRUPADOR', 'Settings2',         '#64748B', NULL,                    NULL, 'Ajustes de datos y mediciones',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- Sub-hijos de MENU_PARAMETROS_CONFIGURACIONES
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000531', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_PARAMETROS_CONFIGURACIONES'), 'MENU_PARAMETROS_TIPOS_DATO',      'Tipos de datos',     'ITEM', 'Type',   '#64748B', '/parametros/tipos-dato',     NULL, 'Definición de tipos de dato dinámico',TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000532', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_PARAMETROS_CONFIGURACIONES'), 'MENU_PARAMETROS_UBICACIONES',     'Ubicaciones',        'ITEM', 'MapPin', '#64748B', '/parametros/ubicaciones',    NULL, 'Plantas, centrales y ubicaciones',    TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000533', (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_PARAMETROS_CONFIGURACIONES'), 'MENU_PARAMETROS_UNIDADES_MEDIDA', 'Unidades de medida', 'ITEM', 'Ruler',  '#64748B', '/parametros/unidades-medida',NULL, 'Unidades de medida estandarizadas',   TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 9. Menús de SEGURIDAD (Hijos de MOD_SEGURIDAD)
-- ============================================================================
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
VALUES
    ('e0000000-0000-4000-a000-000000000071', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_USUARIOS', 'Usuarios', 'ITEM', 'Users',       '#EF4444', '/seguridad/usuarios', NULL, 'Cuentas de usuario y accesos',      TRUE, 1, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000072', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_ROLES',    'Roles',    'ITEM', 'ShieldCheck', '#EF4444', '/seguridad/roles',    NULL, 'Perfiles y asignación de permisos', TRUE, 2, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('e0000000-0000-4000-a000-000000000073', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_MENUS',    'Menús',    'ITEM', 'FolderTree',  '#EF4444', '/seguridad/menus',    NULL, 'Árbol de navegación y rutas',       TRUE, 3, TRUE, NOW(), NOW(), 'seed', 'seed'),
    ('9d84e908-0c49-4721-b4e4-c86aa71815b6', (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_SEGURIDAD'), 'MENU_SEG_PERMISOS', 'Permisos', 'ITEM', 'Key',         '#EF4444', '/seguridad/permisos', NULL, 'Permisos de endpoints de API',      TRUE, 4, TRUE, NOW(), NOW(), 'seed', 'seed')
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

-- ============================================================================
-- 10. Reasignación explícita de padres para garantizar integridad referencial
-- ============================================================================
UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ORGANIZACION')
WHERE codigo IN (
    'MENU_ORG_EMPLEADOS', 'MENU_ORG_AREAS', 'MENU_ORG_CARGOS', 'MENU_ORG_PERSONAS',
    'MENU_ORG_RESPONSABILIDADES', 'MENU_ORG_GRUPOS_APROBADORES', 'MENU_ORG_MIGRACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_ACTIVOS')
WHERE codigo IN (
    'MENU_ACTIVOS_REGISTRO', 'MENU_ACTIVOS_CATALOGO', 'MENU_ACTIVOS_CONSULTA_DOCS',
    'MENU_ACTIVOS_DISPONIBILIDAD', 'MENU_ACTIVOS_CONFIGURACIONES'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_ACTIVOS_CONFIGURACIONES')
WHERE codigo IN (
    'MENU_ACTIVOS_CATEGORIAS', 'MENU_ACTIVOS_TIPOS', 'MENU_ACTIVOS_ACCESORIOS',
    'MENU_ACTIVOS_TIPOS_DOCUMENTO', 'MENU_ACTIVOS_ESTADOS_OPERATIVOS'
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
    'MENU_VEH_DASHBOARD', 'MENU_VEH_SOLICITUDES', 'MENU_VEH_ASIGNACIONES', 'MENU_VEH_SALIDAS',
    'MENU_VEH_MIS_VIAJES', 'MENU_VEH_CALENDARIO_RESERVAS', 'MENU_CONFIGURACIONES_GESTION_VEHICULAR',
    'REPORTES_GESTION_VEHICULAR'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MENU_CONFIGURACIONES_GESTION_VEHICULAR')
WHERE codigo IN (
    'MENU_VEH_CONDUCTORES', 'MENU_VEH_FLOTAS', 'MENU_VEH_TIPOS_SOLICITUD'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'REPORTES_GESTION_VEHICULAR')
WHERE codigo IN (
    'MENU_VEH_HISTORIAL_VIAJES', 'MENU_VEH_CONSUMO_COMBUSTIBLE', 'MENU_VEH_BITACORA', 'MENU_VEH_REP_SALIDAS'
);

UPDATE seguridad.menus
SET menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo = 'MOD_MANTENIMIENTOS')
WHERE codigo IN (
    'MENU_MANT_SOLICITUDES', 'MENU_MANT_APROBACIONES', 'MENU_MANT_ENCARGADO', 'MENU_MANT_SUPERVISOR',
    'MENU_MANT_ORDENES_TRABAJO', 'MENU_MANT_CONTROLES', 'MENU_MANT_ACTIVIDADES', 'MENU_MANT_PLANES',
    'MENU_MANT_PROGRAMACIONES', 'MENU_MANT_CONFIGURACIONES'
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
    'MENU_SEG_USUARIOS', 'MENU_SEG_ROLES', 'MENU_SEG_MENUS', 'MENU_SEG_PERMISOS'
);

-- ============================================================================
-- 11. Sincronizar Asignaciones en ROLES_MENUS
-- ============================================================================

-- A. Asignar TODOS los menús activos a cualquier rol con código o nombre ADMIN
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
WHERE (r.codigo ILIKE '%admin%' OR r.nombre ILIKE '%admin%')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- B. Asignar menús de Gestión Vehicular a ENCARGADO_MOVILIDADES
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
WHERE r.codigo = 'ENCARGADO_MOVILIDADES'
  AND (m.codigo LIKE '%VEH%' OR m.codigo = 'MOD_GESTION_VEHICULAR' OR m.codigo = 'REPORTES_GESTION_VEHICULAR' OR m.codigo = 'MENU_CONFIGURACIONES_GESTION_VEHICULAR')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- C. Asignar menús de conductor a CONDUCTOR
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
WHERE r.codigo = 'CONDUCTOR'
  AND m.codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_VEH_MIS_VIAJES', 'MENU_VEH_SALIDAS', 'REPORTES_GESTION_VEHICULAR', 'MENU_VEH_BITACORA', 'MENU_VEH_REP_SALIDAS')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- D. Asignar menús de solicitante de movilidad a SOLICITANTE_MOVILIDAD
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
WHERE r.codigo = 'SOLICITANTE_MOVILIDAD'
  AND m.codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_VEH_DASHBOARD', 'MENU_VEH_SOLICITUDES', 'MENU_VEH_CALENDARIO_RESERVAS')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- E. Asignar menús de Mantenimiento a ENCARGADO
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
WHERE r.codigo = 'ENCARGADO'
  AND m.codigo IN ('MOD_MANTENIMIENTOS', 'MENU_MANT_ENCARGADO', 'MENU_MANT_ORDENES_TRABAJO', 'MENU_MANT_CONTROLES', 'MENU_MANT_ACTIVIDADES', 'MENU_MANT_PLANES', 'MENU_MANT_PROGRAMACIONES')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- F. Asignar menús de Mantenimiento a SUPERVISOR
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
WHERE r.codigo = 'SUPERVISOR'
  AND m.codigo IN ('MOD_MANTENIMIENTOS', 'MENU_MANT_APROBACIONES', 'MENU_MANT_SUPERVISOR', 'MENU_MANT_ORDENES_TRABAJO', 'MENU_MANT_CONTROLES')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;

-- G. Asignar solicitudes a SOLICITANTE
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
WHERE r.codigo = 'SOLICITANTE'
  AND m.codigo IN ('MOD_MANTENIMIENTOS', 'MENU_MANT_SOLICITUDES')
  AND m.activo = TRUE
ON CONFLICT (rol_id, menu_id) DO NOTHING;
