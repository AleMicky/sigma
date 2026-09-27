-- ============================================================================
-- Migración: V122__add_responsable_and_conductor_to_solicitudes_vehiculares.sql
-- Descripción: Agregar campos responsable_asignacion_id y conductor_asignado_id a solicitudes vehiculares
-- ============================================================================

ALTER TABLE gestion_vehicular.solicitudes_vehiculares
    ADD COLUMN IF NOT EXISTS responsable_asignacion_id UUID,
    ADD COLUMN IF NOT EXISTS conductor_asignado_id     UUID;

CREATE INDEX IF NOT EXISTS idx_solicitud_vehicular_responsable
    ON gestion_vehicular.solicitudes_vehiculares (responsable_asignacion_id);

CREATE INDEX IF NOT EXISTS idx_solicitud_vehicular_conductor
    ON gestion_vehicular.solicitudes_vehiculares (conductor_asignado_id);
