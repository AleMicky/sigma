-- Atributos iniciales por tipo de insumo

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, codigo, nombre, tipo_dato_id, requerido, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8005-000000000001',
    'a1b2c3d4-e5f6-4012-8003-000000000001',
    'MARCA',
    'Marca',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    FALSE,
    0,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'a1b2c3d4-e5f6-4012-8003-000000000001'
      AND LOWER(codigo) = LOWER('MARCA')
);

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, codigo, nombre, tipo_dato_id, requerido, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8005-000000000002',
    'a1b2c3d4-e5f6-4012-8003-000000000001',
    'PROVEEDOR',
    'Proveedor',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    FALSE,
    1,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'a1b2c3d4-e5f6-4012-8003-000000000001'
      AND LOWER(codigo) = LOWER('PROVEEDOR')
);

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, codigo, nombre, tipo_dato_id, requerido, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8005-000000000003',
    'a1b2c3d4-e5f6-4012-8003-000000000002',
    'FECHA_VENCIMIENTO',
    'Fecha de vencimiento',
    'a1b2c3d4-e5f6-4011-8001-000000000005',
    TRUE,
    0,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'a1b2c3d4-e5f6-4012-8003-000000000002'
      AND LOWER(codigo) = LOWER('FECHA_VENCIMIENTO')
);

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, codigo, nombre, tipo_dato_id, requerido, orden, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4012-8005-000000000004',
    'a1b2c3d4-e5f6-4012-8003-000000000002',
    'CONDICION_ALMACENAMIENTO',
    'Condición de almacenamiento',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    FALSE,
    1,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'a1b2c3d4-e5f6-4012-8003-000000000002'
      AND LOWER(codigo) = LOWER('CONDICION_ALMACENAMIENTO')
);
