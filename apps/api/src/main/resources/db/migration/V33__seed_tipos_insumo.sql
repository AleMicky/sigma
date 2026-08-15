-- Tipos de insumo generales

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8003-000000000001',
    'MATERIA_PRIMA',
    'Materia prima',
    'Insumos utilizados como materia prima en la elaboración de productos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipos_insumo WHERE LOWER(codigo) = LOWER('MATERIA_PRIMA')
);

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8003-000000000002',
    'PERECEDERO',
    'Perecedero',
    'Insumos con fecha de vencimiento que requieren condiciones de almacenamiento.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipos_insumo WHERE LOWER(codigo) = LOWER('PERECEDERO')
);

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8003-000000000003',
    'NO_PERECEDERO',
    'No perecedero',
    'Insumos con larga vida útil que no se deterioran con facilidad.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipos_insumo WHERE LOWER(codigo) = LOWER('NO_PERECEDERO')
);

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8003-000000000004',
    'OPERACION',
    'Operación',
    'Insumos de uso diario para la operación del establecimiento.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipos_insumo WHERE LOWER(codigo) = LOWER('OPERACION')
);

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8003-000000000005',
    'OTRO',
    'Otro',
    'Insumos que no encajan en las categorías anteriores.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipos_insumo WHERE LOWER(codigo) = LOWER('OTRO')
);
