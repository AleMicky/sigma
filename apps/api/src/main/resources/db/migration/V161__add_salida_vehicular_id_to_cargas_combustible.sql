-- ============================================================================
-- Migración: V160__add_salida_vehicular_id_to_cargas_combustible.sql
-- Descripción: Integrar cargas_combustible con salidas_vehiculares mediante
--              columna opcional salida_vehicular_id e índice.
-- ============================================================================

ALTER TABLE gestion_vehicular.cargas_combustible
    ADD COLUMN IF NOT EXISTS salida_vehicular_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_carga_combustible_salida'
    ) THEN
        ALTER TABLE gestion_vehicular.cargas_combustible
            ADD CONSTRAINT fk_carga_combustible_salida
                FOREIGN KEY (salida_vehicular_id)
                REFERENCES gestion_vehicular.salidas_vehiculares (id)
                ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_carga_combustible_salida
    ON gestion_vehicular.cargas_combustible (salida_vehicular_id);

