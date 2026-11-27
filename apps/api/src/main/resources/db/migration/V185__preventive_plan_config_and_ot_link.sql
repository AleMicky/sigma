-- ============================================================================
-- Migración: V185__preventive_plan_config_and_ot_link.sql
-- Descripción: REQ-MANT-036. Centralización de Mantenimiento Preventivo:
--   1. Estado, tipo de mantenimiento y criterio plantilla en planes_mantenimiento.
--   2. Tabla de configuración global de umbrales preventivos.
--   3. Vínculo directo orden_trabajo <-> programaciones_mantenimiento
--      (permitiendo OT preventivas sin solicitud previa).
--   4. Vínculo orden_trabajo_id e índice de consulta en historial preventivo.
-- ============================================================================

ALTER TABLE mantenimientos.planes_mantenimiento
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    ADD COLUMN IF NOT EXISTS tipo_mantenimiento_id UUID,
    ADD COLUMN IF NOT EXISTS criterio_default_tipo VARCHAR(20),
    ADD COLUMN IF NOT EXISTS criterio_default_dias INTEGER,
    ADD COLUMN IF NOT EXISTS criterio_default_uso NUMERIC(15, 2);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_plan_tipo_mantenimiento'
    ) THEN
        ALTER TABLE mantenimientos.planes_mantenimiento
            ADD CONSTRAINT fk_plan_tipo_mantenimiento
                FOREIGN KEY (tipo_mantenimiento_id)
                REFERENCES mantenimientos.tipos_mantenimiento (id)
                ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS mantenimientos.configuracion_preventiva (
    id                                  UUID PRIMARY KEY,
    dias_anticipacion_alerta            INTEGER        NOT NULL DEFAULT 15,
    km_anticipacion_alerta              NUMERIC(15, 2) NOT NULL DEFAULT 500.00,
    horas_anticipacion_alerta           NUMERIC(15, 2) NOT NULL DEFAULT 50.00,
    evaluacion_automatica_habilitada    BOOLEAN        NOT NULL DEFAULT TRUE,
    cron_evaluacion                     VARCHAR(100)   NOT NULL DEFAULT '0 0 6 * * *',
    created_at                          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at                          TIMESTAMPTZ,
    created_by                          VARCHAR(100),
    updated_by                          VARCHAR(100),
    created_by_id                       UUID,
    updated_by_id                       UUID
);

INSERT INTO mantenimientos.configuracion_preventiva (
    id,
    dias_anticipacion_alerta,
    km_anticipacion_alerta,
    horas_anticipacion_alerta,
    evaluacion_automatica_habilitada,
    cron_evaluacion,
    created_at,
    created_by
)
SELECT
    gen_random_uuid(),
    15,
    500.00,
    50.00,
    TRUE,
    '0 0 6 * * *',
    NOW(),
    'flyway-v185'
WHERE NOT EXISTS (
    SELECT 1 FROM mantenimientos.configuracion_preventiva
);

ALTER TABLE mantenimientos.orden_trabajo
    ALTER COLUMN solicitud_mantenimiento_id DROP NOT NULL;

ALTER TABLE mantenimientos.orden_trabajo
    ADD COLUMN IF NOT EXISTS programacion_mantenimiento_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_orden_trabajo_programacion'
    ) THEN
        ALTER TABLE mantenimientos.orden_trabajo
            ADD CONSTRAINT fk_orden_trabajo_programacion
                FOREIGN KEY (programacion_mantenimiento_id)
                REFERENCES mantenimientos.programaciones_mantenimiento (id)
                ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orden_trabajo_programacion_id
    ON mantenimientos.orden_trabajo (programacion_mantenimiento_id);

ALTER TABLE mantenimientos.programacion_mantenimiento_historial
    ADD COLUMN IF NOT EXISTS orden_trabajo_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_historial_orden_trabajo'
    ) THEN
        ALTER TABLE mantenimientos.programacion_mantenimiento_historial
            ADD CONSTRAINT fk_historial_orden_trabajo
                FOREIGN KEY (orden_trabajo_id)
                REFERENCES mantenimientos.orden_trabajo (id)
                ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_historial_prog_fecha_disparo
    ON mantenimientos.programacion_mantenimiento_historial (programacion_mantenimiento_id, fecha_disparo DESC);
