INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'TEXT',
    'Texto',
    'Cadena libre (nombre, serie, observaciones).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('TEXT')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000002',
    'TEXTAREA',
    'Texto largo',
    'Texto multilínea para descripciones u observaciones extensas.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('TEXTAREA')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'NUMBER',
    'Número',
    'Valores numéricos enteros (kilometraje, capacidad).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('NUMBER')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'DECIMAL',
    'Decimal',
    'Valores numéricos con decimales (costo, porcentaje).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('DECIMAL')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000005',
    'DATE',
    'Fecha',
    'Solo fecha (alta, vencimiento, revisión).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('DATE')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000006',
    'DATETIME',
    'Fecha y hora',
    'Fecha con hora (registro de eventos o intervenciones).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('DATETIME')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000007',
    'BOOLEAN',
    'Sí / No',
    'Valor booleano (activo, disponible, certificado).',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('BOOLEAN')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000008',
    'SELECT',
    'Selección',
    'Lista de opciones (estado, marca, color).',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('SELECT')
);

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion, permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000009',
    'MULTISELECT',
    'Selección múltiple',
    'Permite elegir varias opciones de un catálogo.',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM parametros.tipos_dato WHERE LOWER(codigo) = LOWER('MULTISELECT')
);
