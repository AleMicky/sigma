-- ============================================================================
-- Migración: V142__seed_estados_operativos_and_tipos_activo_estados.sql
-- Descripción: Carga inicial de catálogo de estados operativos y vinculación con tipos de activo.
-- ============================================================================

-- 1. Insertar catálogo de estados operativos
INSERT INTO activos.estados_operativos (
    id,
    codigo,
    nombre,
    descripcion,
    color,
    created_at,
    updated_at,
    created_by,
    updated_by
) VALUES
    (
        'e1a10000-0000-4000-a000-000000000001',
        'OPERATIVO',
        'Operativo',
        'Activo disponible y en condiciones normales de funcionamiento.',
        '#10B981',
        NOW(),
        NOW(),
        'seed',
        'seed'
    ),
    (
        'e1a10000-0000-4000-a000-000000000002',
        'MANTENIMIENTO',
        'En Mantenimiento',
        'Activo en proceso de mantenimiento preventivo, correctivo o inspección técnica.',
        '#F59E0B',
        NOW(),
        NOW(),
        'seed',
        'seed'
    ),
    (
        'e1a10000-0000-4000-a000-000000000003',
        'FUERA_SERVICIO',
        'Fuera de Servicio',
        'Activo inoperativo debido a averías mecánicas, fallas o siniestros.',
        '#EF4444',
        NOW(),
        NOW(),
        'seed',
        'seed'
    ),
    (
        'e1a10000-0000-4000-a000-000000000004',
        'RESERVA',
        'En Reserva',
        'Activo operativo destinado a respaldo de flota o contingencias.',
        '#3B82F6',
        NOW(),
        NOW(),
        'seed',
        'seed'
    ),
    (
        'e1a10000-0000-4000-a000-000000000005',
        'DE_BAJA',
        'De Baja',
        'Activo retirado permanentemente de servicio o en proceso de disposición final.',
        '#6B7280',
        NOW(),
        NOW(),
        'seed',
        'seed'
    ),
    (
        'e1a10000-0000-4000-a000-000000000006',
        'EN_VIAJE',
        'En Viaje',
        'Vehículo en tránsito ejecutando un viaje o comisión institucional asignada.',
        '#6366F1',
        NOW(),
        NOW(),
        'seed',
        'seed'
    )
ON CONFLICT (codigo) DO UPDATE SET
    nombre      = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    color       = EXCLUDED.color,
    updated_at  = NOW(),
    updated_by  = 'seed';

-- 2. Asociar estados estándar (Operativo, Mantenimiento, Fuera de Servicio, De Baja) a todos los tipos de activo
--    Se define 'OPERATIVO' como predeterminado
INSERT INTO activos.tipos_activo_estados (
    id,
    tipo_activo_id,
    estado_operativo_id,
    predeterminado,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT
    gen_random_uuid(),
    ta.id,
    eo.id,
    (eo.codigo = 'OPERATIVO'),
    NOW(),
    NOW(),
    'seed',
    'seed'
FROM activos.tipos_activo ta
CROSS JOIN activos.estados_operativos eo
WHERE eo.codigo IN ('OPERATIVO', 'MANTENIMIENTO', 'FUERA_SERVICIO', 'DE_BAJA')
ON CONFLICT (tipo_activo_id, estado_operativo_id) DO NOTHING;

-- 3. Asociar estados vehiculares ('En Reserva' y 'En Viaje') específicamente al tipo de activo Vehículo
INSERT INTO activos.tipos_activo_estados (
    id,
    tipo_activo_id,
    estado_operativo_id,
    predeterminado,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT
    gen_random_uuid(),
    ta.id,
    eo.id,
    FALSE,
    NOW(),
    NOW(),
    'seed',
    'seed'
FROM activos.tipos_activo ta
CROSS JOIN activos.estados_operativos eo
WHERE LOWER(ta.nombre) = 'vehículo'
  AND eo.codigo IN ('RESERVA', 'EN_VIAJE')
ON CONFLICT (tipo_activo_id, estado_operativo_id) DO NOTHING;
