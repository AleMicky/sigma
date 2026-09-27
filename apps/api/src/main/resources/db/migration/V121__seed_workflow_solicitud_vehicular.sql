-- ============================================================================
-- Migración: V121__seed_workflow_solicitud_vehicular.sql
-- Descripción: Registrar workflow y correlativo para solicitudes vehiculares
-- ============================================================================

INSERT INTO workflow.workflows (
    id,
    codigo,
    nombre,
    descripcion,
    modulo,
    process_definition_key,
    activo
) VALUES (
    gen_random_uuid(),
    'SOLICITUD_VEHICULAR',
    'Gestión de Viajes y Movilidad',
    'Workflow para gestionar solicitudes de viajes y asignación de vehículos',
    'GESTION_VEHICULAR',
    'procesoGestionViajesMovilidad',
    TRUE
) ON CONFLICT (codigo) DO NOTHING;

INSERT INTO parametros.correlativos (
    id,
    codigo,
    gestion,
    ultimo_numero,
    prefijo,
    longitud
) VALUES (
    gen_random_uuid(),
    'SOLICITUD_VEHICULAR',
    2026,
    0,
    'SV',
    4
) ON CONFLICT (codigo, gestion) DO NOTHING;
