-- ============================================================================
-- Migración: V168__alter_registros_porteria_externos.sql
-- Descripción: Permitir registros de portería externos (persona y vehículo externo).
-- ============================================================================

ALTER TABLE gestion_vehicular.registros_porteria
    ALTER COLUMN empleado_id DROP NOT NULL;

ALTER TABLE gestion_vehicular.registros_porteria
    ADD COLUMN IF NOT EXISTS es_externo BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS persona_externa VARCHAR(200),
    ADD COLUMN IF NOT EXISTS placa_externa VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_es_externo
    ON gestion_vehicular.registros_porteria (es_externo);

CREATE INDEX IF NOT EXISTS idx_registro_porteria_placa_externa
    ON gestion_vehicular.registros_porteria (placa_externa);

