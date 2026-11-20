-- ============================================================================
-- Migración: V173__normalize_timestamp_columns_to_timestamptz.sql
-- Descripción: Estandariza las 8 columnas TIMESTAMP sin zona horaria a
--              TIMESTAMPTZ (asumiendo UTC, consistente con hibernate.jdbc.time_zone=UTC).
-- ============================================================================

-- Activos: asignaciones
ALTER TABLE activos.activo_asignaciones
    ALTER COLUMN fecha_asignacion TYPE TIMESTAMPTZ USING fecha_asignacion AT TIME ZONE 'UTC',
    ALTER COLUMN fecha_devolucion TYPE TIMESTAMPTZ USING fecha_devolucion AT TIME ZONE 'UTC';

-- Incidentes: incidentes de activos
ALTER TABLE incidentes.incidentes_activos
    ALTER COLUMN fecha_hora TYPE TIMESTAMPTZ USING fecha_hora AT TIME ZONE 'UTC';

-- Mantenimientos: adjuntos de solicitud (alineado con BaseEntity Instant)
ALTER TABLE mantenimientos.solicitud_mantenimiento_adjuntos
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Mantenimientos: trazabilidad de solicitud
ALTER TABLE mantenimientos.solicitudes_mantenimiento_trazabilidad
    ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'UTC';

-- Workflow: auditoría (alineado con BaseEntity Instant)
ALTER TABLE workflow.workflows
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
