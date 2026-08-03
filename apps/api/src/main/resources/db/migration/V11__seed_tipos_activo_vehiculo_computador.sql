-- Tipos de activo: Vehículo y Computador

INSERT INTO activos.tipos_activo (
    id, nombre, descripcion, color, icono, created_at, created_by
)
SELECT
    'b1c2d3e4-f5a6-4011-8001-000000000001',
    'Vehículo',
    'Vehículos institucionales (automóviles, camionetas, motos).',
    '#2563EB',
    'Car',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.tipos_activo WHERE LOWER(nombre) = LOWER('Vehículo')
);

INSERT INTO activos.tipos_activo (
    id, nombre, descripcion, color, icono, created_at, created_by
)
SELECT
    'b1c2d3e4-f5a6-4011-8001-000000000002',
    'Computador',
    'Equipos de cómputo (laptops, desktops, workstations).',
    '#0D9488',
    'Laptop',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.tipos_activo WHERE LOWER(nombre) = LOWER('Computador')
);

-- Atributos de Vehículo

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000001',
    ta.id,
    'PLACA',
    'Placa',
    'Número de placa del vehículo.',
    td.id,
    0,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'text'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('PLACA')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000002',
    ta.id,
    'MARCA',
    'Marca',
    'Marca del vehículo.',
    td.id,
    1,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'text'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('MARCA')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000003',
    ta.id,
    'MODELO',
    'Modelo',
    'Modelo del vehículo.',
    td.id,
    2,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'text'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('MODELO')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000004',
    ta.id,
    'ANIO',
    'Año',
    'Año de fabricación.',
    td.id,
    3,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'number'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('ANIO')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000005',
    ta.id,
    'TIPO_COMBUSTIBLE',
    'Tipo de combustible',
    'Combustible utilizado por el vehículo.',
    td.id,
    4,
    TRUE,
    TRUE,
    TRUE,
    'GASOLINA',
    '[
        {"value":"GASOLINA","label":"Gasolina"},
        {"value":"DIESEL","label":"Diésel"},
        {"value":"GNV","label":"GNV"},
        {"value":"ELECTRICO","label":"Eléctrico"},
        {"value":"HIBRIDO","label":"Híbrido"}
    ]'::jsonb,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'select'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('TIPO_COMBUSTIBLE')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000006',
    ta.id,
    'KILOMETRAJE',
    'Kilometraje',
    'Kilometraje actual del odómetro.',
    td.id,
    5,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'number'
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('KILOMETRAJE')
  );

-- Atributos de Computador

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000011',
    ta.id,
    'NUMERO_SERIE',
    'Número de serie',
    'Número de serie del equipo.',
    td.id,
    0,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'text'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('NUMERO_SERIE')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000012',
    ta.id,
    'MARCA',
    'Marca',
    'Marca del equipo.',
    td.id,
    1,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    '[
        {"value":"DELL","label":"Dell"},
        {"value":"HP","label":"HP"},
        {"value":"LENOVO","label":"Lenovo"},
        {"value":"APPLE","label":"Apple"},
        {"value":"ASUS","label":"Asus"},
        {"value":"OTRO","label":"Otro"}
    ]'::jsonb,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'select'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('MARCA')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000013',
    ta.id,
    'MODELO',
    'Modelo',
    'Modelo del equipo.',
    td.id,
    2,
    TRUE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'text'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('MODELO')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000014',
    ta.id,
    'RAM_GB',
    'RAM (GB)',
    'Memoria RAM en gigabytes.',
    td.id,
    3,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'number'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('RAM_GB')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000015',
    ta.id,
    'ALMACENAMIENTO_GB',
    'Almacenamiento (GB)',
    'Capacidad de almacenamiento en gigabytes.',
    td.id,
    4,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'number'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('ALMACENAMIENTO_GB')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000016',
    ta.id,
    'SISTEMA_OPERATIVO',
    'Sistema operativo',
    'Sistema operativo instalado.',
    td.id,
    5,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    '[
        {"value":"WINDOWS_11","label":"Windows 11"},
        {"value":"WINDOWS_10","label":"Windows 10"},
        {"value":"MACOS","label":"macOS"},
        {"value":"LINUX","label":"Linux"},
        {"value":"OTRO","label":"Otro"}
    ]'::jsonb,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'select'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('SISTEMA_OPERATIVO')
  );

INSERT INTO activos.activo_atributos (
    id, tipo_activo_id, codigo, etiqueta, descripcion, tipo_dato_id,
    orden, requerido, visible, editable, valor_defecto, opciones,
    created_at, created_by
)
SELECT
    'c1d2e3f4-a5b6-4011-8001-000000000017',
    ta.id,
    'FECHA_ADQUISICION',
    'Fecha de adquisición',
    'Fecha en que se adquirió el equipo.',
    td.id,
    6,
    FALSE,
    TRUE,
    TRUE,
    NULL,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
JOIN parametros.tipos_dato td ON LOWER(td.codigo) = 'date'
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.activo_atributos aa
      WHERE aa.tipo_activo_id = ta.id
        AND LOWER(aa.codigo) = LOWER('FECHA_ADQUISICION')
  );
