-- Eliminar foreign keys e índices previos asociados a tipo_activo_id
ALTER TABLE activos.accesorios
    DROP CONSTRAINT IF EXISTS fk_accesorios_tipo_activo;

DROP INDEX IF EXISTS activos.uk_accesorios_tipo_codigo_ci;
DROP INDEX IF EXISTS activos.idx_accesorios_tipo_activo_id;

-- Si existen registros previos asociados a tipo_activo, mapear al categoria_id correspondiente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'activos'
          AND table_name = 'accesorios'
          AND column_name = 'tipo_activo_id'
    ) THEN
        -- Intentar actualizar a categoria_id si los tipos_activo tienen categoria_id
        UPDATE activos.accesorios a
        SET tipo_activo_id = ta.categoria_id
        FROM activos.tipos_activo ta
        WHERE a.tipo_activo_id = ta.id
          AND ta.categoria_id IS NOT NULL;

        -- Renombrar columna a categoria_id
        ALTER TABLE activos.accesorios
            RENAME COLUMN tipo_activo_id TO categoria_id;
    END IF;
END $$;

-- Asegurar foreign key a activos.categorias
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_accesorios_categoria'
    ) THEN
        ALTER TABLE activos.accesorios
            ADD CONSTRAINT fk_accesorios_categoria
            FOREIGN KEY (categoria_id)
            REFERENCES activos.categorias (id)
            ON DELETE CASCADE;
    END IF;
END $$;

-- Crear nuevos índices
CREATE UNIQUE INDEX IF NOT EXISTS uk_accesorios_categoria_codigo_ci
    ON activos.accesorios (categoria_id, LOWER(codigo));

CREATE INDEX IF NOT EXISTS idx_accesorios_categoria_id
    ON activos.accesorios (categoria_id);
