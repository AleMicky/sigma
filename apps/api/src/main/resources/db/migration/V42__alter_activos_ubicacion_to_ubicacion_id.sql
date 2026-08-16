ALTER TABLE activos.activos
    DROP COLUMN IF EXISTS ubicacion,
    ADD COLUMN IF NOT EXISTS ubicacion_id UUID;

CREATE INDEX IF NOT EXISTS idx_activos_ubicacion_id
    ON activos.activos (ubicacion_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_activos_ubicacion'
    ) THEN
        ALTER TABLE activos.activos
            ADD CONSTRAINT fk_activos_ubicacion
            FOREIGN KEY (ubicacion_id)
            REFERENCES parametros.ubicaciones (id)
            ON DELETE SET NULL;
    END IF;
END $$;
