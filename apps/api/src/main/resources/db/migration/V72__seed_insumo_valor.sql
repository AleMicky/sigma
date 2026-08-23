BEGIN;

-- ============================================================
-- 1. CATEGORÍAS QUE FALTABAN
--    NEUMÁTICOS Y BATERÍAS
-- ============================================================

INSERT INTO inventarios.categorias_insumo (
    id,
    tipo_insumo_id,
    codigo,
    nombre,
    descripcion,
    created_at,
    created_by
)
SELECT
    'c4000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000004',
    'NEUMATICO_VEHICULAR',
    'Neumático vehicular',
    'Neumáticos utilizados en vehículos de la flota.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('NEUMATICO_VEHICULAR')
);


INSERT INTO inventarios.categorias_insumo (
    id,
    tipo_insumo_id,
    codigo,
    nombre,
    descripcion,
    created_at,
    created_by
)
SELECT
    'c5000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000005',
    'BATERIA_VEHICULAR',
    'Batería vehicular',
    'Baterías utilizadas en vehículos de la flota.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000005'
      AND LOWER(codigo) = LOWER('BATERIA_VEHICULAR')
);


-- ============================================================
-- 2. INSUMOS - COMBUSTIBLE
--
-- Unidad:
-- L = a1b2c3d4-e5f6-4011-8002-000000000026
-- ============================================================

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
    'e1000000-0000-4000-8000-000000000001',
    'COM-001',
    'Diésel',
    'Combustible diésel para vehículos y maquinaria.',
    'c1000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'YPFB',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('COM-001')
);


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
    'e1000000-0000-4000-8000-000000000002',
    'COM-002',
    'Gasolina Especial',
    'Gasolina especial para vehículos livianos.',
    'c1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'YPFB',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('COM-002')
);


-- ============================================================
-- 3. VALORES DINÁMICOS - COMBUSTIBLE
--
-- d100...001 = OCTANAJE
-- d100...002 = CETANAJE
-- d100...003 = AZUFRE_PPM
-- ============================================================

-- Diésel - Cetanaje
INSERT INTO inventarios.insumo_atributo_valores (
    id,
    insumo_id,
    tipo_insumo_atributo_id,
    valor,
    created_at,
    created_by
)
SELECT
    'f1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000002',
    '50',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e1000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd1000000-0000-4000-8000-000000000002'
);


-- Diésel - Azufre
INSERT INTO inventarios.insumo_atributo_valores (
    id,
    insumo_id,
    tipo_insumo_atributo_id,
    valor,
    created_at,
    created_by
)
SELECT
    'f1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000001',
    'd1000000-0000-4000-8000-000000000003',
    '10',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e1000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd1000000-0000-4000-8000-000000000003'
);


-- Gasolina - Octanaje
INSERT INTO inventarios.insumo_atributo_valores (
    id,
    insumo_id,
    tipo_insumo_atributo_id,
    valor,
    created_at,
    created_by
)
SELECT
    'f1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000002',
    'd1000000-0000-4000-8000-000000000001',
    '85',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e1000000-0000-4000-8000-000000000002'
      AND tipo_insumo_atributo_id = 'd1000000-0000-4000-8000-000000000001'
);


-- ============================================================
-- 4. INSUMOS - LUBRICANTES
-- ============================================================

-- Aceite de motor
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
    'e2000000-0000-4000-8000-000000000001',
    'LUB-001',
    'Aceite de motor 15W-40',
    'Aceite lubricante multigrado para motores diésel.',
    'c2000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'Shell',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('LUB-001')
);


-- Aceite hidráulico
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
    'e2000000-0000-4000-8000-000000000002',
    'LUB-002',
    'Aceite hidráulico ISO VG 68',
    'Aceite para sistemas hidráulicos de vehículos y maquinaria.',
    'c2000000-0000-4000-8000-000000000003',
    'a1b2c3d4-e5f6-4011-8002-000000000026',
    'Mobil',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('LUB-002')
);


-- Grasa
-- KG = a1b2c3d4-e5f6-4011-8002-000000000002
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
    'e2000000-0000-4000-8000-000000000003',
    'LUB-003',
    'Grasa multipropósito EP2',
    'Grasa para rodamientos y componentes mecánicos.',
    'c2000000-0000-4000-8000-000000000005',
    'a1b2c3d4-e5f6-4011-8002-000000000002',
    'Mobil',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('LUB-003')
);


-- ============================================================
-- 5. VALORES - ACEITE MOTOR 15W-40
-- ============================================================

-- Viscosidad
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000001',
    'e2000000-0000-4000-8000-000000000001',
    'd2000000-0000-4000-8000-000000000001',
    '15W-40',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000001'
);


-- Norma SAE
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000002',
    'e2000000-0000-4000-8000-000000000001',
    'd2000000-0000-4000-8000-000000000002',
    'SAE 15W-40',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000002'
);


-- Norma API
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000003',
    'e2000000-0000-4000-8000-000000000001',
    'd2000000-0000-4000-8000-000000000003',
    'CK-4',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000003'
);


-- Aplicación
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000004',
    'e2000000-0000-4000-8000-000000000001',
    'd2000000-0000-4000-8000-000000000005',
    'MOTOR_DIESEL',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000005'
);


-- ============================================================
-- 6. VALORES - ACEITE HIDRÁULICO
-- ============================================================

INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000005',
    'e2000000-0000-4000-8000-000000000002',
    'd2000000-0000-4000-8000-000000000001',
    '68',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000002'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000001'
);


INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000006',
    'e2000000-0000-4000-8000-000000000002',
    'd2000000-0000-4000-8000-000000000004',
    'ISO VG 68',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000002'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000004'
);


INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f2000000-0000-4000-8000-000000000007',
    'e2000000-0000-4000-8000-000000000002',
    'd2000000-0000-4000-8000-000000000005',
    'SISTEMA_HIDRAULICO',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e2000000-0000-4000-8000-000000000002'
      AND tipo_insumo_atributo_id = 'd2000000-0000-4000-8000-000000000005'
);


-- ============================================================
-- 7. INSUMO - NEUMÁTICO
--
-- UND = a1b2c3d4-e5f6-4011-8002-000000000028
-- ============================================================

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
    'e4000000-0000-4000-8000-000000000001',
    'NEU-001',
    'Neumático 265/65 R17',
    'Neumático radial para camionetas y vehículos de flota.',
    'c4000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8002-000000000028',
    'Bridgestone',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('NEU-001')
);


-- Ancho = 265
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f4000000-0000-4000-8000-000000000001',
    'e4000000-0000-4000-8000-000000000001',
    'd4000000-0000-4000-8000-000000000001',
    '265',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e4000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd4000000-0000-4000-8000-000000000001'
);


-- Perfil = 65
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f4000000-0000-4000-8000-000000000002',
    'e4000000-0000-4000-8000-000000000001',
    'd4000000-0000-4000-8000-000000000002',
    '65',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e4000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd4000000-0000-4000-8000-000000000002'
);


-- Aro = 17
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f4000000-0000-4000-8000-000000000003',
    'e4000000-0000-4000-8000-000000000001',
    'd4000000-0000-4000-8000-000000000003',
    '17',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e4000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd4000000-0000-4000-8000-000000000003'
);


-- Índice carga
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f4000000-0000-4000-8000-000000000004',
    'e4000000-0000-4000-8000-000000000001',
    'd4000000-0000-4000-8000-000000000004',
    '112',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e4000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd4000000-0000-4000-8000-000000000004'
);


-- Índice velocidad
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f4000000-0000-4000-8000-000000000005',
    'e4000000-0000-4000-8000-000000000001',
    'd4000000-0000-4000-8000-000000000005',
    'H',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e4000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd4000000-0000-4000-8000-000000000005'
);


-- ============================================================
-- 8. INSUMO - BATERÍA
-- ============================================================

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
    'e5000000-0000-4000-8000-000000000001',
    'BAT-001',
    'Batería 12V 70Ah',
    'Batería automotriz para vehículos de la flota.',
    'c5000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8002-000000000028',
    'Bosch',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('BAT-001')
);


-- Voltaje
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f5000000-0000-4000-8000-000000000001',
    'e5000000-0000-4000-8000-000000000001',
    'd5000000-0000-4000-8000-000000000001',
    '12',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e5000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd5000000-0000-4000-8000-000000000001'
);


-- Capacidad Ah
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f5000000-0000-4000-8000-000000000002',
    'e5000000-0000-4000-8000-000000000001',
    'd5000000-0000-4000-8000-000000000002',
    '70',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e5000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd5000000-0000-4000-8000-000000000002'
);


-- CCA
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f5000000-0000-4000-8000-000000000003',
    'e5000000-0000-4000-8000-000000000001',
    'd5000000-0000-4000-8000-000000000003',
    '600',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e5000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd5000000-0000-4000-8000-000000000003'
);


-- ============================================================
-- 9. INSUMO - REPUESTO / FILTRO
-- ============================================================

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
    'e6000000-0000-4000-8000-000000000001',
    'REP-001',
    'Filtro de aceite Toyota Hilux',
    'Filtro de aceite para mantenimiento preventivo.',
    'c6000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8002-000000000028',
    'Toyota',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumos
    WHERE LOWER(codigo) = LOWER('REP-001')
);


-- Número de parte
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f6000000-0000-4000-8000-000000000001',
    'e6000000-0000-4000-8000-000000000001',
    'd6000000-0000-4000-8000-000000000001',
    '90915-YZZD2',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e6000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd6000000-0000-4000-8000-000000000001'
);


-- Marca compatible
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f6000000-0000-4000-8000-000000000002',
    'e6000000-0000-4000-8000-000000000001',
    'd6000000-0000-4000-8000-000000000002',
    'Toyota',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e6000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd6000000-0000-4000-8000-000000000002'
);


-- Modelo compatible
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f6000000-0000-4000-8000-000000000003',
    'e6000000-0000-4000-8000-000000000001',
    'd6000000-0000-4000-8000-000000000003',
    'Hilux',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e6000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd6000000-0000-4000-8000-000000000003'
);


-- Año desde
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f6000000-0000-4000-8000-000000000004',
    'e6000000-0000-4000-8000-000000000001',
    'd6000000-0000-4000-8000-000000000004',
    '2016',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e6000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd6000000-0000-4000-8000-000000000004'
);


-- Año hasta
INSERT INTO inventarios.insumo_atributo_valores (
    id, insumo_id, tipo_insumo_atributo_id,
    valor, created_at, created_by
)
SELECT
    'f6000000-0000-4000-8000-000000000005',
    'e6000000-0000-4000-8000-000000000001',
    'd6000000-0000-4000-8000-000000000005',
    '2025',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.insumo_atributo_valores
    WHERE insumo_id = 'e6000000-0000-4000-8000-000000000001'
      AND tipo_insumo_atributo_id = 'd6000000-0000-4000-8000-000000000005'
);


COMMIT;