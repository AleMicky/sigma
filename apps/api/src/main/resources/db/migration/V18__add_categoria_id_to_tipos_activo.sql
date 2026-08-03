-- Categorías base para asociar tipos de activo existentes
INSERT INTO activos.categorias (
    id, codigo, nombre, descripcion, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'GENERAL',
    'General',
    'Categoría general de activos.',
    0,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.categorias WHERE LOWER(codigo) = LOWER('GENERAL')
);

INSERT INTO activos.categorias (
    id, codigo, nombre, descripcion, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000002',
    'MOVILIDAD',
    'Movilidad',
    'Vehículos y medios de transporte.',
    1,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.categorias WHERE LOWER(codigo) = LOWER('MOVILIDAD')
);

INSERT INTO activos.categorias (
    id, codigo, nombre, descripcion, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'TECNOLOGIA',
    'Tecnología',
    'Equipos tecnológicos e informáticos.',
    2,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.categorias WHERE LOWER(codigo) = LOWER('TECNOLOGIA')
);

ALTER TABLE activos.tipos_activo
    ADD COLUMN categoria_id UUID;

UPDATE activos.tipos_activo ta
SET categoria_id = c.id
FROM activos.categorias c
WHERE ta.categoria_id IS NULL
  AND LOWER(ta.nombre) = LOWER('Vehículo')
  AND LOWER(c.codigo) = LOWER('MOVILIDAD');

UPDATE activos.tipos_activo ta
SET categoria_id = c.id
FROM activos.categorias c
WHERE ta.categoria_id IS NULL
  AND LOWER(ta.nombre) = LOWER('Computador')
  AND LOWER(c.codigo) = LOWER('TECNOLOGIA');

UPDATE activos.tipos_activo ta
SET categoria_id = c.id
FROM activos.categorias c
WHERE ta.categoria_id IS NULL
  AND LOWER(c.codigo) = LOWER('GENERAL');

ALTER TABLE activos.tipos_activo
    ALTER COLUMN categoria_id SET NOT NULL;

ALTER TABLE activos.tipos_activo
    ADD CONSTRAINT fk_tipos_activo_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES activos.categorias (id)
        ON DELETE RESTRICT;

CREATE INDEX idx_tipos_activo_categoria_id
    ON activos.tipos_activo (categoria_id);
