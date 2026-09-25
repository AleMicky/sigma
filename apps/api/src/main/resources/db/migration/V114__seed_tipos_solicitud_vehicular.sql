-- ============================================================================
-- Migración: V114__seed_tipos_solicitud_vehicular.sql
-- Descripción: Carga inicial de tipos de solicitud vehicular.
-- ============================================================================

INSERT INTO gestion_vehicular.tipos_solicitud_vehicular (
    id,
    codigo,
    nombre,
    descripcion,
    created_at,
    updated_at,
    created_by,
    updated_by
)
VALUES
    (
        'b1a2c3d4-0001-4000-8000-000000000001',
        'COMISION',
        'Comisión de servicio',
        'Comisión de servicio y gestiones institucionales',
        NOW(),
        NOW(),
        'system',
        'system'
    ),
    (
        'b1a2c3d4-0002-4000-8000-000000000002',
        'TRASLADO',
        'Traslado de personal',
        'Traslado y transporte de personal',
        NOW(),
        NOW(),
        'system',
        'system'
    ),
    (
        'b1a2c3d4-0003-4000-8000-000000000003',
        'EMERGENCIA',
        'Emergencia',
        'Atención de contingencias y emergencias operativas',
        NOW(),
        NOW(),
        'system',
        'system'
    ),
    (
        'b1a2c3d4-0004-4000-8000-000000000004',
        'OPERATIVO',
        'Trabajo operativo',
        'Labores operativas y trabajos en campo',
        NOW(),
        NOW(),
        'system',
        'system'
    )
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW(),
    updated_by = EXCLUDED.updated_by;
