-- ============================================================================
-- Migración: V135__drop_nivel_combustible_from_viajes_vehiculares.sql
-- Descripción: Eliminar columnas nivel_combustible_salida y nivel_combustible_retorno de la tabla viajes_vehiculares.
-- ============================================================================

ALTER TABLE gestion_vehicular.viajes_vehiculares
    DROP COLUMN IF EXISTS nivel_combustible_salida,
    DROP COLUMN IF EXISTS nivel_combustible_retorno;
