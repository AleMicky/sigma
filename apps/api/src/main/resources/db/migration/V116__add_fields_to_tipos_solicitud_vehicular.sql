-- ============================================================================
-- Migración: V116__add_fields_to_tipos_solicitud_vehicular.sql
-- Descripción: Agregar campos dias_anticipacion, requiere_justificacion y requiere_respaldo a tipos de solicitud vehicular.
-- ============================================================================

ALTER TABLE gestion_vehicular.tipos_solicitud_vehicular
    ADD COLUMN IF NOT EXISTS dias_anticipacion INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS requiere_justificacion BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS requiere_respaldo BOOLEAN NOT NULL DEFAULT FALSE;
