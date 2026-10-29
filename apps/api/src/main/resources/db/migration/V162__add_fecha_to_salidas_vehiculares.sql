-- ============================================================================
-- Migración: V162__add_fecha_to_salidas_vehiculares.sql
-- Descripción: Agregar columna fecha a salidas_vehiculares para registrar la
--              fecha y hora operativa de la salida vehicular.
-- ============================================================================

ALTER TABLE gestion_vehicular.salidas_vehiculares
    ADD COLUMN IF NOT EXISTS fecha TIMESTAMPTZ;

UPDATE gestion_vehicular.salidas_vehiculares
SET fecha = COALESCE(fecha, created_at, NOW())
WHERE fecha IS NULL;

ALTER TABLE gestion_vehicular.salidas_vehiculares
    ALTER COLUMN fecha SET NOT NULL,
    ALTER COLUMN fecha SET DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_salida_fecha
    ON gestion_vehicular.salidas_vehiculares (fecha);

