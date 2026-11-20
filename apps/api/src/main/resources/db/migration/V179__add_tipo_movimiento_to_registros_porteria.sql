-- ============================================================================
-- Migración: V179__add_tipo_movimiento_to_registros_porteria.sql
-- Descripción: Agrega el campo tipo_movimiento (SALIDA | ENTRADA) a
--              gestion_vehicular.registros_porteria para distinguir si el
--              registro inicia con una salida (se completa con entrada) o con
--              una entrada (se completa con salida).
-- ============================================================================

ALTER TABLE gestion_vehicular.registros_porteria
    ADD COLUMN IF NOT EXISTS tipo_movimiento VARCHAR(20) NOT NULL DEFAULT 'SALIDA';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_registro_porteria_tipo_movimiento'
    ) THEN
        ALTER TABLE gestion_vehicular.registros_porteria
            ADD CONSTRAINT ck_registro_porteria_tipo_movimiento
                CHECK (tipo_movimiento IN ('SALIDA', 'ENTRADA'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_registro_porteria_tipo_movimiento
    ON gestion_vehicular.registros_porteria (tipo_movimiento);
