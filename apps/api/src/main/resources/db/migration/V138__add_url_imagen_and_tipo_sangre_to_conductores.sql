-- ============================================================================
-- Migración: V138__add_url_imagen_and_tipo_sangre_to_conductores.sql
-- Descripción: Agregar url_imagen y tipo_sangre a la tabla de conductores
-- ============================================================================

ALTER TABLE gestion_vehicular.conductores
    ADD COLUMN IF NOT EXISTS url_imagen VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS tipo_sangre VARCHAR(20);
