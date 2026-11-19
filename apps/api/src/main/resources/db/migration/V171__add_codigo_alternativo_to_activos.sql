ALTER TABLE activos.activos
    ADD COLUMN IF NOT EXISTS codigo_alternativo VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_activos_codigo_alternativo_ci
    ON activos.activos (LOWER(codigo_alternativo))
    WHERE codigo_alternativo IS NOT NULL;
