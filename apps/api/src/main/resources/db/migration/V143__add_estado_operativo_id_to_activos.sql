-- ============================================================================
-- Migración: V143__add_estado_operativo_id_to_activos.sql
-- Descripción: Agregar estado_operativo_id a la tabla activos.activos y FK a estados_operativos.
-- ============================================================================

ALTER TABLE activos.activos
    ADD COLUMN IF NOT EXISTS estado_operativo_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_activos_estado_operativo'
    ) THEN
        ALTER TABLE activos.activos
            ADD CONSTRAINT fk_activos_estado_operativo
            FOREIGN KEY (estado_operativo_id)
            REFERENCES activos.estados_operativos (id)
            ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activos_estado_operativo_id
    ON activos.activos (estado_operativo_id);

-- Asignar estado operativo predeterminado (OPERATIVO) a los activos que no tengan estado asignado
UPDATE activos.activos
SET estado_operativo_id = 'e1a10000-0000-4000-a000-000000000001'
WHERE estado_operativo_id IS NULL;
