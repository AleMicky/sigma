-- ============================================================================
-- Migración: V148__create_programaciones_mantenimiento_and_criterios.sql
-- Descripción: Creación de tablas de programación de mantenimiento, criterios
--              de ejecución preventiva e historial de disparos.
-- ============================================================================

CREATE TABLE IF NOT EXISTS mantenimientos.programaciones_mantenimiento (
    id                           UUID PRIMARY KEY,
    plan_mantenimiento_activo_id UUID        NOT NULL,
    activo                       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at                   TIMESTAMPTZ NOT NULL,
    updated_at                   TIMESTAMPTZ,
    created_by                   VARCHAR(100),
    updated_by                   VARCHAR(100),
    created_by_id                UUID,
    updated_by_id                UUID,
    CONSTRAINT fk_prog_plan_mantenimiento_activo FOREIGN KEY (plan_mantenimiento_activo_id)
        REFERENCES mantenimientos.plan_mantenimiento_activos (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_programaciones_mantenimiento_plan_activo
    ON mantenimientos.programaciones_mantenimiento (plan_mantenimiento_activo_id);

CREATE TABLE IF NOT EXISTS mantenimientos.programacion_mantenimiento_criterios (
    id                            UUID PRIMARY KEY,
    programacion_mantenimiento_id UUID           NOT NULL,
    tipo_criterio                 VARCHAR(30)    NOT NULL,
    intervalo_dias                INTEGER,
    intervalo_uso                 NUMERIC(15, 2),
    proxima_fecha                 DATE,
    proximo_valor_uso             NUMERIC(15, 2),
    activo                        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at                    TIMESTAMPTZ    NOT NULL,
    updated_at                    TIMESTAMPTZ,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    created_by_id                 UUID,
    updated_by_id                 UUID,
    CONSTRAINT fk_criterio_prog_mantenimiento FOREIGN KEY (programacion_mantenimiento_id)
        REFERENCES mantenimientos.programaciones_mantenimiento (id) ON DELETE CASCADE,
    CONSTRAINT chk_criterio_tipo_criterio CHECK (tipo_criterio IN ('TIEMPO', 'KILOMETRAJE', 'HORAS_USO'))
);

CREATE INDEX IF NOT EXISTS idx_criterios_prog_mantenimiento
    ON mantenimientos.programacion_mantenimiento_criterios (programacion_mantenimiento_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_criterio_prog_tipo
    ON mantenimientos.programacion_mantenimiento_criterios (programacion_mantenimiento_id, tipo_criterio);

CREATE TABLE IF NOT EXISTS mantenimientos.programacion_mantenimiento_historial (
    id                            UUID PRIMARY KEY,
    programacion_mantenimiento_id UUID         NOT NULL,
    solicitud_mantenimiento_id    UUID,
    solicitud_numero              VARCHAR(30),
    tipo_criterio_disparador      VARCHAR(30)  NOT NULL,
    valor_disparador              VARCHAR(100) NOT NULL,
    valor_limite                  VARCHAR(100),
    fecha_disparo                 TIMESTAMPTZ  NOT NULL,
    snapshot_valores              TEXT,
    completado                    BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_servicio                DATE,
    valor_uso_servicio            NUMERIC(15, 2),
    observacion                   VARCHAR(500),
    created_at                    TIMESTAMPTZ  NOT NULL,
    updated_at                    TIMESTAMPTZ,
    created_by                    VARCHAR(100),
    updated_by                    VARCHAR(100),
    created_by_id                 UUID,
    updated_by_id                 UUID,
    CONSTRAINT fk_historial_prog_mantenimiento FOREIGN KEY (programacion_mantenimiento_id)
        REFERENCES mantenimientos.programaciones_mantenimiento (id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_solicitud_mantenimiento FOREIGN KEY (solicitud_mantenimiento_id)
        REFERENCES mantenimientos.solicitudes_mantenimiento (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_historial_prog_mantenimiento
    ON mantenimientos.programacion_mantenimiento_historial (programacion_mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_historial_solicitud_mantenimiento
    ON mantenimientos.programacion_mantenimiento_historial (solicitud_mantenimiento_id);
