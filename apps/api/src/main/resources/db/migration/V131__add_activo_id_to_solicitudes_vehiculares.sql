-- Migration V131: Agregar activo_id a solicitudes vehiculares
ALTER TABLE gestion_vehicular.solicitudes_vehiculares
    ADD COLUMN IF NOT EXISTS activo_id UUID;

CREATE INDEX IF NOT EXISTS idx_solicitud_vehicular_activo
    ON gestion_vehicular.solicitudes_vehiculares (activo_id);
