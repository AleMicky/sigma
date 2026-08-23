-- ============================================================
-- SIGMA
-- SEED INVENTARIOS - VEHÍCULOS
-- ============================================================

BEGIN;


-- ============================================================
-- 1. TIPOS DE DATO
-- ============================================================

INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
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
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('TEXT')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
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
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('TEXTAREA')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'NUMBER',
    'Número',
    'Valores numéricos enteros.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('NUMBER')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'DECIMAL',
    'Decimal',
    'Valores numéricos con decimales.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('DECIMAL')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000005',
    'DATE',
    'Fecha',
    'Solo fecha.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('DATE')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000006',
    'DATETIME',
    'Fecha y hora',
    'Fecha con hora.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('DATETIME')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000007',
    'BOOLEAN',
    'Sí / No',
    'Valor booleano.',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('BOOLEAN')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000008',
    'SELECT',
    'Selección',
    'Lista de opciones.',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('SELECT')
);


INSERT INTO parametros.tipos_dato (
    id, codigo, nombre, descripcion,
    permite_opciones, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8001-000000000009',
    'MULTISELECT',
    'Selección múltiple',
    'Permite elegir varias opciones.',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.tipos_dato
    WHERE LOWER(codigo) = LOWER('MULTISELECT')
);


-- ============================================================
-- 2. UNIDADES DE MEDIDA NECESARIAS
-- ============================================================

INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo,
    permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000029',
    'L',
    'Litro',
    'l',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.unidades_medida
    WHERE LOWER(codigo) = LOWER('L')
);


INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo,
    permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000030',
    'ML',
    'Mililitro',
    'ml',
    TRUE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.unidades_medida
    WHERE LOWER(codigo) = LOWER('ML')
);


INSERT INTO parametros.unidades_medida (
    id, codigo, nombre, simbolo,
    permite_decimal, created_at, created_by
)
SELECT
    'a1b2c3d4-e5f6-4011-8002-000000000031',
    'UND',
    'Unidad',
    'und',
    FALSE,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM parametros.unidades_medida
    WHERE LOWER(codigo) = LOWER('UND')
);


-- ============================================================
-- 3. TIPOS DE INSUMO
-- ============================================================

INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000001',
    'COMBUSTIBLE',
    'Combustible',
    'Combustibles utilizados por vehículos, maquinaria y equipos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('COMBUSTIBLE')
);


INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000002',
    'LUBRICANTE',
    'Lubricante',
    'Aceites y grasas utilizados en mantenimiento vehicular.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('LUBRICANTE')
);


INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000003',
    'FLUIDO_VEHICULAR',
    'Fluido vehicular',
    'Fluidos utilizados para operación y mantenimiento de vehículos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('FLUIDO_VEHICULAR')
);


INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000004',
    'NEUMATICO',
    'Neumático',
    'Neumáticos para vehículos y maquinaria.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('NEUMATICO')
);


INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000005',
    'BATERIA',
    'Batería',
    'Baterías para vehículos y maquinaria.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('BATERIA')
);


INSERT INTO inventarios.tipos_insumo (
    id, codigo, nombre, descripcion,
    created_at, created_by
)
SELECT
    'b1000000-0000-4000-8000-000000000006',
    'REPUESTO_VEHICULAR',
    'Repuesto vehicular',
    'Repuestos utilizados en mantenimiento preventivo y correctivo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.tipos_insumo
    WHERE LOWER(codigo) = LOWER('REPUESTO_VEHICULAR')
);


-- ============================================================
-- 4. CATEGORÍAS - COMBUSTIBLE
-- ============================================================

INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    'DIESEL',
    'Diésel',
    'Combustible diésel para vehículos y maquinaria.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000001'
      AND LOWER(codigo) = LOWER('DIESEL')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000001',
    'GASOLINA',
    'Gasolina',
    'Gasolina para vehículos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1
    FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000001'
      AND LOWER(codigo) = LOWER('GASOLINA')
);


-- ============================================================
-- 5. CATEGORÍAS - LUBRICANTE
-- ============================================================

INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c2000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'ACEITE_MOTOR',
    'Aceite de motor',
    'Aceite lubricante para motores.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('ACEITE_MOTOR')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c2000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000002',
    'ACEITE_TRANSMISION',
    'Aceite de transmisión',
    'Lubricante para transmisiones y cajas de cambio.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('ACEITE_TRANSMISION')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c2000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000002',
    'ACEITE_HIDRAULICO',
    'Aceite hidráulico',
    'Lubricante para sistemas hidráulicos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('ACEITE_HIDRAULICO')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c2000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000002',
    'ACEITE_DIFERENCIAL',
    'Aceite de diferencial',
    'Lubricante para diferenciales y engranajes.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('ACEITE_DIFERENCIAL')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c2000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000002',
    'GRASA',
    'Grasa lubricante',
    'Grasa para rodamientos y componentes mecánicos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('GRASA')
);


-- ============================================================
-- 6. CATEGORÍAS - FLUIDOS
-- ============================================================

INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c3000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000003',
    'REFRIGERANTE',
    'Refrigerante',
    'Refrigerante y anticongelante.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000003'
      AND LOWER(codigo) = LOWER('REFRIGERANTE')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c3000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000003',
    'LIQUIDO_FRENO',
    'Líquido de frenos',
    'Fluido para sistemas hidráulicos de freno.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000003'
      AND LOWER(codigo) = LOWER('LIQUIDO_FRENO')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c3000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000003',
    'ADITIVO',
    'Aditivo',
    'Aditivos para motores, combustibles y sistemas mecánicos.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000003'
      AND LOWER(codigo) = LOWER('ADITIVO')
);


-- ============================================================
-- 7. CATEGORÍAS - REPUESTOS
-- ============================================================

INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000006',
    'FILTRO',
    'Filtros',
    'Filtros de aceite, combustible, aire y otros.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('FILTRO')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000006',
    'FRENO',
    'Sistema de frenos',
    'Pastillas, discos, zapatas y otros componentes.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('FRENO')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000006',
    'MOTOR',
    'Motor',
    'Repuestos relacionados con el motor.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('MOTOR')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000006',
    'SUSPENSION',
    'Suspensión',
    'Repuestos del sistema de suspensión.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('SUSPENSION')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000006',
    'DIRECCION',
    'Dirección',
    'Repuestos del sistema de dirección.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('DIRECCION')
);


INSERT INTO inventarios.categorias_insumo (
    id, tipo_insumo_id, codigo, nombre,
    descripcion, created_at, created_by
)
SELECT
    'c6000000-0000-4000-8000-000000000006',
    'b1000000-0000-4000-8000-000000000006',
    'ELECTRICO',
    'Sistema eléctrico',
    'Componentes eléctricos y electrónicos del vehículo.',
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.categorias_insumo
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('ELECTRICO')
);


-- ============================================================
-- 8. ATRIBUTOS - COMBUSTIBLE
-- ============================================================

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'OCTANAJE',
    'Octanaje',
    FALSE,
    1,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000001'
      AND LOWER(codigo) = LOWER('OCTANAJE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'CETANAJE',
    'Índice de cetano',
    FALSE,
    2,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000001'
      AND LOWER(codigo) = LOWER('CETANAJE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000001',
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'AZUFRE_PPM',
    'Contenido de azufre (ppm)',
    FALSE,
    3,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000001'
      AND LOWER(codigo) = LOWER('AZUFRE_PPM')
);


-- ============================================================
-- 9. ATRIBUTOS - LUBRICANTE
-- ============================================================

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd2000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'VISCOSIDAD',
    'Viscosidad',
    TRUE,
    1,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('VISCOSIDAD')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd2000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'NORMA_SAE',
    'Norma SAE',
    FALSE,
    2,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('NORMA_SAE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd2000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'NORMA_API',
    'Norma API',
    FALSE,
    3,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('NORMA_API')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd2000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'NORMA_ISO',
    'Norma ISO',
    FALSE,
    4,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('NORMA_ISO')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd2000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000002',
    'a1b2c3d4-e5f6-4011-8001-000000000008',
    'APLICACION',
    'Aplicación',
    FALSE,
    5,
    '[
        "MOTOR_GASOLINA",
        "MOTOR_DIESEL",
        "TRANSMISION_MANUAL",
        "TRANSMISION_AUTOMATICA",
        "DIFERENCIAL",
        "SISTEMA_HIDRAULICO",
        "RODAMIENTOS"
    ]'::jsonb,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000002'
      AND LOWER(codigo) = LOWER('APLICACION')
);


-- ============================================================
-- 10. ATRIBUTOS - NEUMÁTICO
-- ============================================================

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd4000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000004',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'ANCHO',
    'Ancho',
    TRUE,
    1,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('ANCHO')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd4000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000004',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'PERFIL',
    'Perfil',
    TRUE,
    2,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('PERFIL')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd4000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000004',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'ARO',
    'Diámetro de aro',
    TRUE,
    3,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('ARO')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd4000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000004',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'INDICE_CARGA',
    'Índice de carga',
    FALSE,
    4,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('INDICE_CARGA')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd4000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000004',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'INDICE_VELOCIDAD',
    'Índice de velocidad',
    FALSE,
    5,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000004'
      AND LOWER(codigo) = LOWER('INDICE_VELOCIDAD')
);


-- ============================================================
-- 11. ATRIBUTOS - BATERÍA
-- ============================================================

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd5000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000005',
    'a1b2c3d4-e5f6-4011-8001-000000000004',
    'VOLTAJE',
    'Voltaje (V)',
    TRUE,
    1,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000005'
      AND LOWER(codigo) = LOWER('VOLTAJE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd5000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000005',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'CAPACIDAD_AH',
    'Capacidad (Ah)',
    TRUE,
    2,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000005'
      AND LOWER(codigo) = LOWER('CAPACIDAD_AH')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd5000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000005',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'CCA',
    'Corriente de arranque en frío',
    FALSE,
    3,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000005'
      AND LOWER(codigo) = LOWER('CCA')
);


-- ============================================================
-- 12. ATRIBUTOS - REPUESTO VEHICULAR
-- ============================================================

INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd6000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000006',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'NUMERO_PARTE',
    'Número de parte',
    FALSE,
    1,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('NUMERO_PARTE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd6000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000006',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'MARCA_COMPATIBLE',
    'Marca compatible',
    FALSE,
    2,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('MARCA_COMPATIBLE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd6000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000006',
    'a1b2c3d4-e5f6-4011-8001-000000000001',
    'MODELO_COMPATIBLE',
    'Modelo compatible',
    FALSE,
    3,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('MODELO_COMPATIBLE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd6000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000006',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'ANIO_DESDE',
    'Año desde',
    FALSE,
    4,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('ANIO_DESDE')
);


INSERT INTO inventarios.tipo_insumo_atributos (
    id, tipo_insumo_id, tipo_dato_id,
    codigo, nombre, requerido, orden,
    opciones, created_at, created_by
)
SELECT
    'd6000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000006',
    'a1b2c3d4-e5f6-4011-8001-000000000003',
    'ANIO_HASTA',
    'Año hasta',
    FALSE,
    5,
    NULL,
    TIMESTAMPTZ '2026-01-01 00:00:00+00',
    'system'
    WHERE NOT EXISTS (
    SELECT 1 FROM inventarios.tipo_insumo_atributos
    WHERE tipo_insumo_id = 'b1000000-0000-4000-8000-000000000006'
      AND LOWER(codigo) = LOWER('ANIO_HASTA')
);


COMMIT;