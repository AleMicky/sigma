-- ============================================================================
-- Migration V127: Agregar columna color y enriquecer diseño visual de Menús
-- - Agrega columna color VARCHAR(50) a seguridad.menus
-- - Ajusta descripción a VARCHAR(300)
-- - Añade índices optimizados para visualización y orden
-- - Actualiza colores, iconos y metadatos de los menús existentes
-- - Vincula todos los menús al rol ADMIN
-- ============================================================================

-- 1. Agregar columna color e índices si no existen
ALTER TABLE seguridad.menus
    ADD COLUMN IF NOT EXISTS color VARCHAR(50);

ALTER TABLE seguridad.menus
    ALTER COLUMN descripcion TYPE VARCHAR(300);

CREATE INDEX IF NOT EXISTS idx_menus_activo_visible
    ON seguridad.menus (activo, visible_en_menu);

CREATE INDEX IF NOT EXISTS idx_menus_padre_orden
    ON seguridad.menus (menu_padre_id, orden);

-- 2. Asignar colores e iconos por Módulo Raíz
UPDATE seguridad.menus
SET color = '#3B82F6', icono = 'LayoutDashboard', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_INICIO', 'MENU_INICIO');

UPDATE seguridad.menus
SET color = '#8B5CF6', icono = 'Building2', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_ORGANIZACION', 'MENU_ORGANIZACION');

UPDATE seguridad.menus
SET color = '#10B981', icono = 'Boxes', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_ACTIVOS', 'MENU_ACTIVOS');

UPDATE seguridad.menus
SET color = '#F59E0B', icono = 'Package', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_INVENTARIOS', 'MENU_INVENTARIOS');

UPDATE seguridad.menus
SET color = '#06B6D4', icono = 'Truck', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR');

UPDATE seguridad.menus
SET color = '#EC4899', icono = 'Wrench', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_MANTENIMIENTOS', 'MENU_MANTENIMIENTOS');

UPDATE seguridad.menus
SET color = '#64748B', icono = 'Settings2', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_PARAMETROS', 'MENU_PARAMETROS');

UPDATE seguridad.menus
SET color = '#EF4444', icono = 'Shield', tipo = 'MODULO', updated_at = NOW()
WHERE codigo IN ('MOD_SEGURIDAD', 'MENU_SEGURIDAD');

-- 3. Actualizar menús de Organización (#8B5CF6)
UPDATE seguridad.menus
SET color = '#8B5CF6', updated_at = NOW()
WHERE codigo LIKE 'MENU_ORG_%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_ORGANIZACION', 'MENU_ORGANIZACION') LIMIT 1);

-- 4. Actualizar menús de Activos (#10B981)
UPDATE seguridad.menus
SET color = '#10B981', updated_at = NOW()
WHERE codigo LIKE 'MENU_ACTIVOS_%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_ACTIVOS', 'MENU_ACTIVOS') LIMIT 1);

-- 5. Actualizar menús de Inventarios (#F59E0B)
UPDATE seguridad.menus
SET color = '#F59E0B', updated_at = NOW()
WHERE codigo LIKE 'MENU_INV%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_INVENTARIOS', 'MENU_INVENTARIOS') LIMIT 1);

-- 6. Actualizar menús de Gestión Vehicular (#06B6D4)
UPDATE seguridad.menus
SET color = '#06B6D4', updated_at = NOW()
WHERE codigo LIKE 'MENU_VEH%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_GESTION_VEHICULAR', 'MENU_GESTION_VEHICULAR') LIMIT 1);

-- 7. Actualizar menús de Mantenimiento (#EC4899)
UPDATE seguridad.menus
SET color = '#EC4899', updated_at = NOW()
WHERE codigo LIKE 'MENU_MANT_%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_MANTENIMIENTOS', 'MENU_MANTENIMIENTOS') LIMIT 1);

-- 8. Actualizar menús de Parámetros (#64748B)
UPDATE seguridad.menus
SET color = '#64748B', updated_at = NOW()
WHERE codigo LIKE 'MENU_PARAM%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_PARAMETROS', 'MENU_PARAMETROS') LIMIT 1);

-- 9. Actualizar menús de Seguridad (#EF4444)
UPDATE seguridad.menus
SET color = '#EF4444', updated_at = NOW()
WHERE codigo LIKE 'MENU_SEG_%'
   OR menu_padre_id = (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_SEGURIDAD', 'MENU_SEGURIDAD') LIMIT 1);

-- 10. Insertar MENU_SEG_PERMISOS si no existe
INSERT INTO seguridad.menus (id, menu_padre_id, codigo, nombre, tipo, icono, color, ruta, badge, descripcion, visible_en_menu, orden, activo, created_at, updated_at, created_by, updated_by)
SELECT
    gen_random_uuid(),
    (SELECT id FROM seguridad.menus WHERE codigo IN ('MOD_SEGURIDAD', 'MENU_SEGURIDAD') LIMIT 1),
    'MENU_SEG_PERMISOS',
    'Permisos',
    'ITEM',
    'Key',
    '#EF4444',
    '/seguridad/permisos',
    NULL,
    'Permisos de endpoints de API',
    TRUE,
    4,
    TRUE,
    NOW(),
    NOW(),
    'seed',
    'seed'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.menus WHERE codigo = 'MENU_SEG_PERMISOS');

-- 11. Vincular automáticamente todos los menús al rol ADMIN / ROLE_ADMIN
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
WHERE (r.codigo ILIKE '%ADMIN%' OR r.nombre ILIKE '%admin%')
  AND m.activo = TRUE
  AND NOT EXISTS (
      SELECT 1
      FROM seguridad.roles_menus rm
      WHERE rm.rol_id = r.id AND rm.menu_id = m.id
  );
