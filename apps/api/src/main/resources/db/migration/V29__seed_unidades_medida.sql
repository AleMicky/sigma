-- Unidades de medida generales

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000001',
    'UND',
    'Unidad',
    'und',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('UND')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000002',
    'KG',
    'Kilogramo',
    'kg',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('KG')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000003',
    'G',
    'Gramo',
    'g',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('G')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000004',
    'TON',
    'Tonelada',
    't',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('TON')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000005',
    'M',
    'Metro',
    'm',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('M')
);

-- Unidades de medida de Vehículo

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000011',
    'KM',
    'Kilómetro',
    'km',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('KM')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000012',
    'MI',
    'Milla',
    'mi',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('MI')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000013',
    'KM/H',
    'Kilómetros por hora',
    'km/h',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('KM/H')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000014',
    'L',
    'Litro',
    'l',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('L')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000015',
    'GAL',
    'Galón',
    'gal',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('GAL')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000016',
    'KM/L',
    'Kilómetros por litro',
    'km/l',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('KM/L')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000017',
    'HP',
    'Caballo de fuerza',
    'hp',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('HP')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000018',
    'KW',
    'Kilovatio',
    'kW',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('KW')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000019',
    'CC',
    'Centímetro cúbico',
    'cc',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('CC')
);

-- Unidades de medida de Computador

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000021',
    'MB',
    'Megabyte',
    'MB',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('MB')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000022',
    'GB',
    'Gigabyte',
    'GB',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('GB')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000023',
    'TB',
    'Terabyte',
    'TB',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('TB')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000024',
    'MHZ',
    'Megahercio',
    'MHz',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('MHZ')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000025',
    'GHZ',
    'Gigahercio',
    'GHz',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('GHZ')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'PULG',
    'Pulgada',
    'in',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('PULG')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000027',
    'W',
    'Vatio',
    'W',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('W')
);

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo, permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000028',
    'V',
    'Voltio',
    'V',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.unidades_medida WHERE LOWER(codigo) = LOWER('V')
);
