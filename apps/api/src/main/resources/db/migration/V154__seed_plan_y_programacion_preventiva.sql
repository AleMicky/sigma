-- ============================================================================
-- Migración: V154__seed_plan_y_programacion_preventiva.sql
-- Descripción: Carga de datos de prueba para planes y programaciones preventivas.
--              - 1 Plan Preventivo para Vehículos con 4 actividades.
--              - 2 Asignaciones de activo (MDF114 y MDF120).
--              - 2 Programaciones de mantenimiento con criterios de Tiempo y Km.
--              - Actualización de odómetro numérico para prueba de evaluación.
-- ============================================================================

-- 1. Plan de Mantenimiento Preventivo
INSERT INTO mantenimientos.planes_mantenimiento (
    id, tipo_activo_id, codigo, nombre, descripcion, created_at, updated_at, created_by, updated_by
)
SELECT
    'e1000000-0001-4000-8000-000000000001',
    ta.id,
    'PLAN-VEH-PREV-01',
    'Mantenimiento Preventivo Flota Vehicular',
    'Plan integral de mantenimiento preventivo vehicular cada 5,000 km o 90 días calendario para camionetas y vehículos livianos.',
    NOW(), NOW(), 'system', 'system'
FROM activos.tipos_activo ta
WHERE LOWER(ta.nombre) = LOWER('Vehículo')
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 2. Actividades del Plan de Mantenimiento
INSERT INTO mantenimientos.plan_mantenimiento_actividades (
    id, plan_mantenimiento_id, actividad_mantenimiento_aplicacion_id, orden, obligatorio, created_at, updated_at, created_by, updated_by
) VALUES
-- Inspección Pre-Operacional
(
    'e2000000-0001-4000-8000-000000000001',
    'e1000000-0001-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000001',
    1, TRUE, NOW(), NOW(), 'system', 'system'
),
-- Lavado y Engrase General
(
    'e2000000-0001-4000-8000-000000000002',
    'e1000000-0001-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000002',
    2, TRUE, NOW(), NOW(), 'system', 'system'
),
-- Cambio de Aceite y Filtros (Motor)
(
    'e2000000-0001-4000-8000-000000000003',
    'e1000000-0001-4000-8000-000000000001',
    'b2000000-0002-4000-8000-000000000001',
    3, TRUE, NOW(), NOW(), 'system', 'system'
),
-- Diagnóstico Electrónico OBD-II y Prueba de Ruta
(
    'e2000000-0001-4000-8000-000000000004',
    'e1000000-0001-4000-8000-000000000001',
    'b2000000-0001-4000-8000-000000000003',
    4, TRUE, NOW(), NOW(), 'system', 'system'
) ON CONFLICT (plan_mantenimiento_id, actividad_mantenimiento_aplicacion_id) DO NOTHING;

-- 3. Asignación de Activos al Plan
-- Activo MDF114 ('098d6c8b-2071-43bf-987c-37aec82e5af8') con Responsable dinámico de organizacion.empleados
INSERT INTO mantenimientos.plan_mantenimiento_activos (
    id, plan_mantenimiento_id, activo_id, responsable_id, fecha_inicio, fecha_fin, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e3000000-0001-4000-8000-000000000001',
    'e1000000-0001-4000-8000-000000000001',
    '098d6c8b-2071-43bf-987c-37aec82e5af8', -- MDF114
    (SELECT id FROM organizacion.empleados LIMIT 1),
    CURRENT_DATE - INTERVAL '60 days',
    NULL,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.planes_mantenimiento WHERE id = 'e1000000-0001-4000-8000-000000000001')
  AND EXISTS (SELECT 1 FROM activos.activos WHERE id = '098d6c8b-2071-43bf-987c-37aec82e5af8')
ON CONFLICT (plan_mantenimiento_id, activo_id) WHERE activo = TRUE DO NOTHING;

-- Activo MDF120 ('c8f6d9bf-5fb0-49de-9908-31a86cfa85f8')
INSERT INTO mantenimientos.plan_mantenimiento_activos (
    id, plan_mantenimiento_id, activo_id, responsable_id, fecha_inicio, fecha_fin, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e3000000-0001-4000-8000-000000000002',
    'e1000000-0001-4000-8000-000000000001',
    'c8f6d9bf-5fb0-49de-9908-31a86cfa85f8', -- MDF120
    (SELECT id FROM organizacion.empleados LIMIT 1),
    CURRENT_DATE - INTERVAL '30 days',
    NULL,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.planes_mantenimiento WHERE id = 'e1000000-0001-4000-8000-000000000001')
  AND EXISTS (SELECT 1 FROM activos.activos WHERE id = 'c8f6d9bf-5fb0-49de-9908-31a86cfa85f8')
ON CONFLICT (plan_mantenimiento_id, activo_id) WHERE activo = TRUE DO NOTHING;

-- 4. Programaciones de Mantenimiento Preventivo
INSERT INTO mantenimientos.programaciones_mantenimiento (
    id, plan_mantenimiento_activo_id, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e4000000-0001-4000-8000-000000000001',
    'e3000000-0001-4000-8000-000000000001',
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.plan_mantenimiento_activos WHERE id = 'e3000000-0001-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mantenimientos.programaciones_mantenimiento (
    id, plan_mantenimiento_activo_id, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e4000000-0001-4000-8000-000000000002',
    'e3000000-0001-4000-8000-000000000002',
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.plan_mantenimiento_activos WHERE id = 'e3000000-0001-4000-8000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 5. Criterios de Ejecución Preventiva
-- MDF114: Tiempo cada 90 días
INSERT INTO mantenimientos.programacion_mantenimiento_criterios (
    id, programacion_mantenimiento_id, tipo_criterio, intervalo_dias, intervalo_uso, proxima_fecha, proximo_valor_uso, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e5000000-0001-4000-8000-000000000001',
    'e4000000-0001-4000-8000-000000000001',
    'TIEMPO',
    90,
    NULL,
    CURRENT_DATE + INTERVAL '30 days',
    NULL,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.programaciones_mantenimiento WHERE id = 'e4000000-0001-4000-8000-000000000001')
ON CONFLICT (programacion_mantenimiento_id, tipo_criterio) DO NOTHING;

-- MDF114: Kilometraje cada 5,000 km (Límite 50,000 km)
INSERT INTO mantenimientos.programacion_mantenimiento_criterios (
    id, programacion_mantenimiento_id, tipo_criterio, intervalo_dias, intervalo_uso, proxima_fecha, proximo_valor_uso, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e5000000-0001-4000-8000-000000000002',
    'e4000000-0001-4000-8000-000000000001',
    'KILOMETRAJE',
    NULL,
    5000.00,
    NULL,
    50000.00,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.programaciones_mantenimiento WHERE id = 'e4000000-0001-4000-8000-000000000001')
ON CONFLICT (programacion_mantenimiento_id, tipo_criterio) DO NOTHING;

-- MDF120: Tiempo cada 90 días
INSERT INTO mantenimientos.programacion_mantenimiento_criterios (
    id, programacion_mantenimiento_id, tipo_criterio, intervalo_dias, intervalo_uso, proxima_fecha, proximo_valor_uso, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e5000000-0002-4000-8000-000000000001',
    'e4000000-0001-4000-8000-000000000002',
    'TIEMPO',
    90,
    NULL,
    CURRENT_DATE + INTERVAL '60 days',
    NULL,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.programaciones_mantenimiento WHERE id = 'e4000000-0001-4000-8000-000000000002')
ON CONFLICT (programacion_mantenimiento_id, tipo_criterio) DO NOTHING;

-- MDF120: Kilometraje cada 5,000 km (Límite 15,000 km)
INSERT INTO mantenimientos.programacion_mantenimiento_criterios (
    id, programacion_mantenimiento_id, tipo_criterio, intervalo_dias, intervalo_uso, proxima_fecha, proximo_valor_uso, activo, created_at, updated_at, created_by, updated_by
)
SELECT
    'e5000000-0002-4000-8000-000000000002',
    'e4000000-0001-4000-8000-000000000002',
    'KILOMETRAJE',
    NULL,
    5000.00,
    NULL,
    15000.00,
    TRUE,
    NOW(), NOW(), 'system', 'system'
WHERE EXISTS (SELECT 1 FROM mantenimientos.programaciones_mantenimiento WHERE id = 'e4000000-0001-4000-8000-000000000002')
ON CONFLICT (programacion_mantenimiento_id, tipo_criterio) DO NOTHING;

-- 6. Actualizar odómetro numérico de los vehículos para validación automática
-- MDF114 odómetro en 50250 (Supera los 50,000 km -> Disparador inmediato)
UPDATE activos.activo_atributo_valores
SET valor = '50250.00'
WHERE activo_id = '098d6c8b-2071-43bf-987c-37aec82e5af8'
  AND activo_atributo_id = 'c1d2e3f4-a5b6-4011-8001-000000000006';

INSERT INTO activos.activo_atributo_valores (
    id, activo_id, activo_atributo_id, valor, created_at, updated_at, created_by, updated_by
)
SELECT
    'e6000000-0001-4000-8000-000000000001',
    '098d6c8b-2071-43bf-987c-37aec82e5af8',
    'c1d2e3f4-a5b6-4011-8001-000000000006',
    '50250.00',
    NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.activo_atributo_valores
    WHERE activo_id = '098d6c8b-2071-43bf-987c-37aec82e5af8'
      AND activo_atributo_id = 'c1d2e3f4-a5b6-4011-8001-000000000006'
);

-- MDF120 odómetro en 12300 (Menor a 15,000 km -> Al día)
UPDATE activos.activo_atributo_valores
SET valor = '12300.00'
WHERE activo_id = 'c8f6d9bf-5fb0-49de-9908-31a86cfa85f8'
  AND activo_atributo_id = 'c1d2e3f4-a5b6-4011-8001-000000000006';

INSERT INTO activos.activo_atributo_valores (
    id, activo_id, activo_atributo_id, valor, created_at, updated_at, created_by, updated_by
)
SELECT
    'e6000000-0001-4000-8000-000000000002',
    'c8f6d9bf-5fb0-49de-9908-31a86cfa85f8',
    'c1d2e3f4-a5b6-4011-8001-000000000006',
    '12300.00',
    NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
    SELECT 1 FROM activos.activo_atributo_valores
    WHERE activo_id = 'c8f6d9bf-5fb0-49de-9908-31a86cfa85f8'
      AND activo_atributo_id = 'c1d2e3f4-a5b6-4011-8001-000000000006'
);
