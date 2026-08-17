-- Alter existing table to match the entity (motivo_mantenimiento VARCHAR -> motivo_mantenimiento_id UUID)
-- The table was created in V47 with motivo_mantenimiento as VARCHAR, but the entity uses motivoMantenimientoId as UUID

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    DROP COLUMN IF EXISTS motivo_mantenimiento;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD COLUMN motivo_mantenimiento_id UUID;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ALTER COLUMN area_solicitante_id DROP NOT NULL;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ALTER COLUMN fecha_solicitud SET NOT NULL;
