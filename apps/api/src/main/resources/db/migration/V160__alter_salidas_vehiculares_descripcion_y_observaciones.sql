-- ============================================================================
-- Migración: V160__alter_salidas_vehiculares_descripcion_y_observaciones.sql
-- Descripción: Reemplazar columnas motivo, origen y destino por
--              descripcion_actividad y observaciones en salidas_vehiculares.
-- ============================================================================

ALTER TABLE gestion_vehicular.salidas_vehiculares
    ADD COLUMN IF NOT EXISTS descripcion_actividad TEXT,
    ADD COLUMN IF NOT EXISTS observaciones TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'gestion_vehicular'
          AND table_name = 'salidas_vehiculares'
          AND column_name = 'motivo'
    ) THEN
        EXECUTE 'UPDATE gestion_vehicular.salidas_vehiculares SET descripcion_actividad = COALESCE(descripcion_actividad, motivo, '''') WHERE descripcion_actividad IS NULL';
    ELSE
        UPDATE gestion_vehicular.salidas_vehiculares
        SET descripcion_actividad = ''
        WHERE descripcion_actividad IS NULL;
    END IF;
END $$;

ALTER TABLE gestion_vehicular.salidas_vehiculares
    ALTER COLUMN descripcion_actividad SET NOT NULL;

ALTER TABLE gestion_vehicular.salidas_vehiculares
    DROP COLUMN IF EXISTS motivo,
    DROP COLUMN IF EXISTS origen,
    DROP COLUMN IF EXISTS destino;

