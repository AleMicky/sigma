-- Categorías de insumo generales

INSERT INTO inventarios.categorias_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8002-000000000001',
    'ALIMENTOS',
    'Alimentos',
    'Insumos alimenticios',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo WHERE LOWER(codigo) = LOWER('ALIMENTOS')
);

INSERT INTO inventarios.categorias_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8002-000000000002',
    'BEBIDAS',
    'Bebidas',
    'Insumos de bebidas',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo WHERE LOWER(codigo) = LOWER('BEBIDAS')
);

INSERT INTO inventarios.categorias_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8002-000000000003',
    'LIMPIEZA',
    'Limpieza',
    'Insumos de limpieza y aseo',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo WHERE LOWER(codigo) = LOWER('LIMPIEZA')
);

INSERT INTO inventarios.categorias_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8002-000000000004',
    'PAPELERIA',
    'Papelería',
    'Insumos de papelería y oficina',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo WHERE LOWER(codigo) = LOWER('PAPELERIA')
);

INSERT INTO inventarios.categorias_insumo (
    id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8002-000000000005',
    'HERRAMIENTAS',
    'Herramientas',
    'Herramientas y utensilios',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo WHERE LOWER(codigo) = LOWER('HERRAMIENTAS')
);
