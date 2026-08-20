ALTER TABLE mantenimientos.solicitudes_mantenimiento
    DROP COLUMN IF EXISTS motivo_mantenimiento_id;

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    ADD COLUMN motivo_mantenimiento VARCHAR(200);

ALTER TABLE mantenimientos.solicitudes_mantenimiento
    DROP COLUMN IF EXISTS area_solicitante_id;
