-- Componentes de Vehículo

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000001',
    ta.id,
    'MOTOR',
    'Motor',
    'Motor del vehículo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('MOTOR')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000002',
    ta.id,
    'TRANSMISION',
    'Transmisión',
    'Caja de cambios y transmisión.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('TRANSMISION')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000003',
    ta.id,
    'FRENOS',
    'Sistema de frenos',
    'Frenos delanteros y traseros.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('FRENOS')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000004',
    ta.id,
    'SUSPENSION',
    'Suspensión',
    'Sistema de suspensión del vehículo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('SUSPENSION')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000005',
    ta.id,
    'DIRECCION',
    'Dirección',
    'Sistema de dirección.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('DIRECCION')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000006',
    ta.id,
    'SISTEMA_ELECTRICO',
    'Sistema eléctrico',
    'Batería, alternador y cableado.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('SISTEMA_ELECTRICO')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000007',
    ta.id,
    'NEUMATICOS',
    'Neumáticos',
    'Juego de neumáticos del vehículo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('NEUMATICOS')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000008',
    ta.id,
    'CARROCERIA',
    'Carrocería',
    'Carrocería y chasis exterior.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('CARROCERIA')
  );

-- Componentes de Computador

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000011',
    ta.id,
    'CPU',
    'Procesador',
    'Unidad central de procesamiento.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('CPU')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000012',
    ta.id,
    'RAM',
    'Memoria RAM',
    'Módulos de memoria RAM.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('RAM')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000013',
    ta.id,
    'DISCO',
    'Almacenamiento',
    'Disco duro o SSD.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('DISCO')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000014',
    ta.id,
    'PLACA_MADRE',
    'Placa madre',
    'Tarjeta madre del equipo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('PLACA_MADRE')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000015',
    ta.id,
    'FUENTE',
    'Fuente de poder',
    'Fuente de alimentación.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('FUENTE')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000016',
    ta.id,
    'PANTALLA',
    'Pantalla',
    'Pantalla integrada o monitor.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('PANTALLA')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000017',
    ta.id,
    'TECLADO',
    'Teclado',
    'Teclado del equipo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('TECLADO')
  );

INSERT INTO activos.componentes (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, created_by
)
SELECT
    'd1e2f3a4-b5c6-4011-8001-000000000018',
    ta.id,
    'BATERIA',
    'Batería',
    'Batería del equipo portátil.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Computador')
  AND NOT EXISTS (
      SELECT 1
      FROM activos.componentes c
      WHERE c.tipo_activo_id = ta.id
        AND LOWER(c.codigo) = LOWER('BATERIA')
  );
