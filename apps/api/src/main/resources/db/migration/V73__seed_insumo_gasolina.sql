INSERT INTO inventarios.insumos (
    id,
    codigo,
    nombre,
    descripcion,
    categoria_insumo_id,
    unidad_medida_id,
    marca,
    created_at,
    created_by
)
SELECT
    'e1000000-0000-4000-8000-000000000003',
    'COM-003',
    'Gasolina Normal',
    'Gasolina normal para vehículos livianos.',
    'c1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'YPFB',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('COM-003')
);

INSERT INTO inventarios.insumo_atributo_valores (
    id,
    insumo_id,
    tipo_insumo_atributo_id,
    valor,
    created_at,
    created_by
)
SELECT
    'f1000000-0000-4000-8000-000000000004',
    'e1000000-0000-4000-8000-000000000003',
    'd1000000-0000-4000-8000-000000000001',
    '85',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e1000000-0000-4000-8000-000000000003'
      AND tipo_insumo_atributo_id = 'd1000000-0000-4000-8000-000000000001'
);