-- ============================================================================
-- Migración: V132__add_nivel_combustible_to_viajes_vehiculares.sql
-- Descripción: Agregar campos de nivel de combustible inicial (salida) y final (retorno) a la tabla de viajes vehiculares.
-- ============================================================================

ALTER TABLE gestion_vehicular.viajes_vehiculares
    ADD COLUMN IF NOT EXISTS nivel_combustible_salida INTEGER,
    ADD COLUMN IF NOT EXISTS nivel_combustible_retorno INTEGER;
