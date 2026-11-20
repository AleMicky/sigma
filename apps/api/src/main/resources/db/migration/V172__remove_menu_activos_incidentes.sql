-- ============================================================================
-- Migración: V172__remove_menu_activos_incidentes.sql
-- Descripción: Elimina el menú "Gestión de Incidentes" del módulo de Activos
--              junto con sus asignaciones de roles y permisos asociados.
-- ============================================================================

DELETE FROM seguridad.permisos
WHERE menu_id IN (
    SELECT id
    FROM seguridad.menus
    WHERE codigo = 'MENU_ACTIVOS_INCIDENTES'
       OR ruta = '/activos/incidentes'
       OR id = 'e0000000-0000-4000-a000-000000000036'
);

DELETE FROM seguridad.roles_menus
WHERE menu_id IN (
    SELECT id
    FROM seguridad.menus
    WHERE codigo = 'MENU_ACTIVOS_INCIDENTES'
       OR ruta = '/activos/incidentes'
       OR id = 'e0000000-0000-4000-a000-000000000036'
);

DELETE FROM seguridad.menus
WHERE codigo = 'MENU_ACTIVOS_INCIDENTES'
   OR ruta = '/activos/incidentes'
   OR id = 'e0000000-0000-4000-a000-000000000036';
