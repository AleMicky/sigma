ALTER TABLE inventarios.categorias_insumo
    ADD COLUMN IF NOT EXISTS tipo_insumo_id UUID;

UPDATE inventarios.categorias_insumo
SET tipo_insumo_id = (SELECT id FROM inventarios.tipos_insumo LIMIT 1)
WHERE tipo_insumo_id IS NULL;

ALTER TABLE inventarios.categorias_insumo
    ALTER COLUMN tipo_insumo_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_categoria_insumo_tipo'
    ) THEN
        ALTER TABLE inventarios.categorias_insumo
            ADD CONSTRAINT fk_categoria_insumo_tipo
                FOREIGN KEY (tipo_insumo_id)
                REFERENCES inventarios.tipos_insumo (id);
    END IF;
END $$;

DROP INDEX IF EXISTS inventarios.uk_categorias_insumo_codigo_ci;

CREATE INDEX IF NOT EXISTS idx_categoria_insumo_tipo
    ON inventarios.categorias_insumo (tipo_insumo_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_categoria_insumo_tipo_codigo
    ON inventarios.categorias_insumo (tipo_insumo_id, LOWER(codigo));
